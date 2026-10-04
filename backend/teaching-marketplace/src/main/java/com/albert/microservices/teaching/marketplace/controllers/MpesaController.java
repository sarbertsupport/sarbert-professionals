package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.CoinWalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/m")
public class MpesaController {

    private final CoinWalletService walletService;
    private static final Logger logger = LoggerFactory.getLogger(MpesaController.class);

    public MpesaController(CoinWalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/initiate")
    public Mono<ResponseEntity<ApiResponse>> initiateMpesaPayment(
            @RequestParam Integer userId,
            @RequestParam String phoneNumber,
            @RequestParam Double amount,
            @RequestParam int coins,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {

        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format(
                "userId=%d, phoneNumber=%s, amount=%.2f, coins=%d, idempotencyKey=%s",
                userId, phoneNumber, amount, coins, idempotencyKey
        );

        logger.info("Initiating M-Pesa payment - TransactionId: {}, Request: {}", transactionId, requestPayload);

        return walletService.initiateMpesaCoinPurchase(userId, phoneNumber, amount, coins, idempotencyKey)
                .map(response -> {
                    int code = response.getHeaders().getResponseCode();
                    if (code >= 200 && code < 300) {
                        logger.info("M-Pesa STK initiate accepted - TransactionId: {}, Duration: {}ms",
                                transactionId, System.currentTimeMillis() - startTime);
                    } else {
                        logger.warn("M-Pesa STK initiate returned {} - TransactionId: {}, Duration: {}ms, message: {}",
                                code, transactionId, System.currentTimeMillis() - startTime,
                                response.getHeaders().getResponseMessage());
                    }
                    return ResponseEntity.status(code)
                            .header("Idempotency-Key", idempotencyKey)
                            .body(response);
                })
                .onErrorResume(e -> {
                    logger.error("M-Pesa initiation failed - TransactionId: {}, Error: {}",
                            transactionId, e.getMessage(), e);
                    return Mono.just(ResponseEntity.badRequest()
                            .header("Idempotency-Key", idempotencyKey)
                            .body(ApiResponse.createResponse(400, "Payment initiation failed", e.getMessage(), null)));
                });
    }

    @PostMapping("/callback")
    public Mono<ResponseEntity<String>> handleMpesaCallback(@RequestBody Map<String, Object> callbackData) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        /*
         * Acknowledge immediately. Safaricom often closes the HTTP connection after ~10s; keeping the full
         * R2DBC chain on the request thread gets cancelled and surfaces
         * "No value for key [ConnectionPool[PostgreSQL]] bound to context" during cleanup.
         * Processing is detached so wallet updates complete even after the client disconnects.
         */
        logger.info("M-Pesa callback accepted for async processing - TransactionId: {}", transactionId);

        walletService.handleMpesaCallback(callbackData)
                .subscribeOn(Schedulers.boundedElastic())
                .subscribe(
                        v -> {
                        },
                        e -> logger.error("M-Pesa callback processing failed - TransactionId: {}",
                                transactionId, e),
                        () -> logger.info("M-Pesa callback processing finished - TransactionId: {}, Duration: {}ms",
                                transactionId, System.currentTimeMillis() - startTime)
                );

        return Mono.just(ResponseEntity.ok("OK"));
    }
}