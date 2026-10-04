package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.services.CoinWalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/v1/paystack-webhook")
public class PaystackWebhookController {
    private static final Logger log = LoggerFactory.getLogger(PaystackWebhookController.class);

    @Value("${paystack.webhook.secret}")
    private String webhookSecret;

    private final CoinWalletService walletService;

    public PaystackWebhookController(CoinWalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/webhook")
    public Mono<ResponseEntity<String>> handleWebhook(@RequestBody String payload, 
                                                  @RequestHeader("x-paystack-signature") String signature) {
    return Mono.fromCallable(() -> {
        // Verify webhook signature
        if (!verifySignature(payload, signature)) {
            log.warn("Paystack webhook: signature verification failed");
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Parse webhook data
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> webhookData = mapper.readValue(payload, Map.class);

        // Handle different event types
        String event = (String) webhookData.get("event");
        Map<String, Object> data = (Map<String, Object>) webhookData.get("data");

        log.info("Paystack webhook: event={} reference={} status={}",
                event, data != null ? data.get("reference") : null, data != null ? data.get("status") : null);
        if (log.isDebugEnabled() && data != null) {
            log.debug("Paystack webhook payload summary: keys={}", data.keySet());
        }

        // Extract reference from webhook data
        String reference = (String) data.get("reference");
        if (reference == null) {
            log.warn("Paystack webhook: no reference in payload for event={}", event);
            return ResponseEntity.badRequest().body("No reference found");
        }

        switch (event) {
            case "charge.success":
                return walletService.verifyAndCompleteTransaction(reference)
                        .doOnNext(response -> log.debug("Paystack webhook charge.success completed reference={}", reference))
                        .thenReturn(ResponseEntity.ok("Payment succeeded"));

            case "charge.failed":
                return walletService.verifyAndCompleteTransaction(reference)
                        .doOnNext(response -> log.debug("Paystack webhook charge.failed processed reference={}", reference))
                        .thenReturn(ResponseEntity.ok("Payment failed"));

            case "charge.abandoned":
                return walletService.verifyAndCompleteTransaction(reference)
                        .doOnNext(response -> log.debug("Paystack webhook charge.abandoned processed reference={}", reference))
                        .thenReturn(ResponseEntity.ok("Payment abandoned"));

            default:
                log.debug("Paystack webhook: unhandled event={} reference={}", event, reference);
                return Mono.just(ResponseEntity.ok("Event received but not handled: " + event));
        }
    }).flatMap(result -> {
        if (result instanceof Mono) {
            return (Mono<ResponseEntity<String>>) result;
        } else {
            return Mono.just((ResponseEntity<String>) result);
        }
    })
    .onErrorResume(e -> {
        log.error("Paystack webhook processing error: {}", e.getMessage(), e);
        return Mono.just(ResponseEntity.badRequest().body("Webhook error: " + e.getMessage()));
    });
}

    private boolean verifySignature(String payload, String signature) {
        try {
            // Create HMAC SHA512 hash
            Mac sha512_HMAC = Mac.getInstance("HmacSHA512");
            SecretKeySpec secret_key_spec = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512_HMAC.init(secret_key_spec);
            
            byte[] hash = sha512_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedSignature = java.util.Base64.getEncoder().encodeToString(hash);

            boolean match = signature.equals(computedSignature);
            if (!match) {
                log.debug("Paystack webhook signature mismatch (received len={}, computed len={})",
                        signature != null ? signature.length() : 0, computedSignature.length());
            }
            return match;
        } catch (Exception e) {
            log.warn("Paystack webhook signature verification exception: {}", e.getMessage());
            return false;
        }
    }
} 