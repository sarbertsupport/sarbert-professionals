package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.services.CoinWalletService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-callback")
public class PaymentCallbackController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentCallbackController.class);
    private final CoinWalletService walletService;

    @Autowired
    public PaymentCallbackController(CoinWalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public Mono<ResponseEntity<String>> handlePaymentCallback(
            @RequestParam("reference") String reference,
            @RequestParam(value = "trxref", required = false) String trxref) {
        
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("reference=%s, trxref=%s", reference, trxref);
        
        LoggingUtility.logInfo(logger, transactionId, "handlePaymentCallback",
                null, 200, "Paystack callback received", requestPayload, null);
        
        // Use trxref if available, otherwise use reference
        String transactionReference = trxref != null ? trxref : reference;
        
        if (transactionReference == null || transactionReference.trim().isEmpty()) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "handlePaymentCallback",
                    duration, 400, "Missing transaction reference", 
                    "Both reference and trxref are null/empty", requestPayload, null);
            return Mono.just(ResponseEntity.badRequest().body("Transaction reference is required"));
        }
        
        return walletService.verifyAndCompleteTransaction(transactionReference)
                .flatMap(apiResponse -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "handlePaymentCallback",
                            duration, 200, "Payment processed successfully", 
                            "Reference: " + transactionReference, apiResponse.toString());
                    return Mono.just(ResponseEntity.ok("Payment processed successfully"));
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "handlePaymentCallback",
                            duration, 400, "Payment verification failed", 
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ResponseEntity.badRequest()
                            .body("Payment verification failed: " + e.getMessage()));
                });
    }

    @PostMapping
    public Mono<ResponseEntity<String>> handlePaymentCallbackPost(@RequestBody Map<String, Object> callbackData) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = callbackData.toString();
        
        LoggingUtility.logInfo(logger, transactionId, "handlePaymentCallbackPost",
                null, 200, "Paystack webhook received", requestPayload, null);
        
        String reference = (String) callbackData.get("reference");
        
        if (reference == null || reference.trim().isEmpty()) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "handlePaymentCallbackPost",
                    duration, 400, "Missing reference in webhook payload", 
                    "Reference field is null/empty", requestPayload, null);
            return Mono.just(ResponseEntity.badRequest().body("Reference is required"));
        }
        
        return walletService.verifyAndCompleteTransaction(reference)
                .flatMap(apiResponse -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "handlePaymentCallbackPost",
                            duration, 200, "Webhook payment processed successfully", 
                            "Reference: " + reference, apiResponse.toString());
                    return Mono.just(ResponseEntity.ok("Payment processed successfully"));
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "handlePaymentCallbackPost",
                            duration, 400, "Webhook payment verification failed", 
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ResponseEntity.badRequest()
                            .body("Payment verification failed: " + e.getMessage()));
                });
    }
} 