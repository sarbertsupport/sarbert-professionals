package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.services.PaystackService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaystackServiceImpl implements PaystackService {
    private static final Logger logger = LoggerFactory.getLogger(PaystackServiceImpl.class);
    private static final String PAYSTACK_BASE_URL = "https://api.paystack.co";

    @Value("${paystack.secret.key}")
    private String paystackSecretKey;

    @Value("${paystack.timeout.seconds:8}")
    private int paystackTimeout;

    private WebClient webClient;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl(PAYSTACK_BASE_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + paystackSecretKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2MB buffer
                .build();

        logger.info("Paystack WebClient initialized (timeout={}s, secretKeyConfigured={})",
                paystackTimeout, paystackSecretKey != null && !paystackSecretKey.isBlank());
    }

    @Override
    public Mono<Map<String, Object>> initializeTransaction(Double amount, String currency, 
                                                          String description,
                                                          Map<String, String> metadata, 
                                                          String email,
                                                          String reference,
                                                          String callbackUrl) {
        String transactionId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();
        String requestPayload = String.format("amount: %.2f, currency: %s, email: %s", amount, currency, email);

        logger.debug("Paystack initialize: {} ({})", transactionId, requestPayload);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("amount", (long) (amount * 100)); // Paystack expects amount in cents (smallest currency unit)
        // requestBody.put("currency", "NGN"); // Temporarily removed to test
        requestBody.put("email", email);
        requestBody.put("reference", reference);
        requestBody.put("callback_url", callbackUrl != null ? callbackUrl : "http://localhost:3000/success");
        requestBody.put("metadata", metadata);
        
        // Force card payments by specifying channels - according to Paystack docs
        requestBody.put("channels", new String[]{"card"});
        if (logger.isTraceEnabled()) {
            logger.trace("Paystack initialize requestBody keys={}", requestBody.keySet());
        }
        return webClient.post()
                .uri("/transaction/initialize")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (Map<String, Object>) response)
                .doOnSuccess(response ->
                        logger.debug("Paystack initialize OK in {}ms id={} status={}",
                                Duration.between(startTime, Instant.now()).toMillis(),
                                transactionId, response.get("status"))
                )
                .doOnError(e -> {
                    String errorType = e instanceof java.util.concurrent.TimeoutException ? "TIMEOUT" : "API_ERROR";
                    logger.error("Paystack initialize failed {} in {}ms id={}: {}",
                            errorType, Duration.between(startTime, Instant.now()).toMillis(),
                            transactionId, e.getMessage());
                })
                .subscribeOn(Schedulers.boundedElastic())
                .timeout(Duration.ofSeconds(30)); // Increased timeout to 30 seconds
    }

    @Override
    public Mono<Map<String, Object>> verifyTransaction(String reference) {
        String transactionId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();

        logger.debug("Paystack verify: id={} reference={}", transactionId, reference);

        return webClient.get()
                .uri("/transaction/verify/" + reference)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (Map<String, Object>) response)
                .doOnSuccess(response ->
                        logger.debug("Paystack verify OK in {}ms ref={} status={}",
                                Duration.between(startTime, Instant.now()).toMillis(),
                                reference, response.get("status"))
                )
                .doOnError(e ->
                        logger.debug("Paystack verify HTTP/client error in {}ms ref={}: {}",
                                Duration.between(startTime, Instant.now()).toMillis(),
                                reference, e.getMessage())
                )
                .subscribeOn(Schedulers.boundedElastic())
                .timeout(Duration.ofSeconds(paystackTimeout));
    }

    @Override
    public Mono<Map<String, Object>> chargeCard(Double amount, String currency, 
                                               String description,
                                               Map<String, String> metadata, 
                                               String email,
                                               String authorizationCode,
                                               String reference) {
        String transactionId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();
        String requestPayload = String.format("amount: %.2f, currency: %s, email: %s", amount, currency, email);

        logger.debug("Paystack charge: id={} ({})", transactionId, requestPayload);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("amount", (long) (amount * 100));
        requestBody.put("currency", currency.toUpperCase());
        requestBody.put("email", email);
        requestBody.put("authorization_code", authorizationCode);
        requestBody.put("reference", reference);
        requestBody.put("metadata", metadata);

        return webClient.post()
                .uri("/transaction/charge_authorization")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (Map<String, Object>) response)
                .doOnSuccess(response ->
                        logger.debug("Paystack charge OK in {}ms id={} status={}",
                                Duration.between(startTime, Instant.now()).toMillis(),
                                transactionId, response.get("status"))
                )
                .doOnError(e ->
                        logger.error("Paystack charge failed in {}ms id={}: {}",
                                Duration.between(startTime, Instant.now()).toMillis(),
                                transactionId, e.getMessage())
                )
                .subscribeOn(Schedulers.boundedElastic())
                .timeout(Duration.ofSeconds(paystackTimeout));
    }
} 