package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

import java.util.Map;

public interface MpesaService {
    Mono<Void> handleMpesaCallback(Map<String, Object> callbackData);

    Mono<ApiResponse> initiateSTKPush(Integer userId, String phoneNumber, Double amount, int coins,
                                      String idempotencyKey);

    /**
     * Admin reconciliation: STK Push Query v2. Updates ledger when query shows a successful payment
     * for a still-pending row; persists query payload for audit.
     */
    Mono<ApiResponse> reconcileStkViaQueryV2(long coinTransactionId);
}
