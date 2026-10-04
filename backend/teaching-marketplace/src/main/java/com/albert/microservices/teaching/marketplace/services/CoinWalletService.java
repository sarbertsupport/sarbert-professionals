package com.albert.microservices.teaching.marketplace.services;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public interface CoinWalletService {
    Mono<ApiResponse> getWalletByUserId(Integer userId);
    Mono<ApiResponse> getUserTransactions(Integer userId);
    Mono<ApiResponse> getAllTransactions(int page, int size,
                                         LocalDate startDate, LocalDate endDate,
                                         String status, String email, String transactionUuid,
                                         String entryType, String paystackPaymentId);
    Mono<ApiResponse> getTransactionById(Long id);
    Mono<ApiResponse> initiateCoinPurchase(Integer userId, Double amount, String currency,int numberOfCoins,
                                           String cardToken,String idempotencyKey);
    Mono<ApiResponse> completeTransaction(String transactionUuid, String paystackPaymentId);
    Mono<ApiResponse> failTransaction(String transactionUuid, String reason);
    Mono<ApiResponse> initiateCoinDeduction(Integer userId, int coinsToDeduct, String description, Long jobId);
    Mono<ApiResponse> initiateCoinDeductionStudent(Integer teacherId,Integer clientUserId, int coinsToDeduct, String description, Long jobId);
    Mono<ApiResponse> completeMpesaTransaction(String transactionUuid, String mpesaReceiptNumber);
    Mono<ApiResponse>initiateMpesaCoinPurchase(Integer userId, String phoneNumber, Double amount, int coins, String idempotencyKey);
    Mono<Void> handleMpesaCallback(Map<String, Object> callbackData);
    Mono<ApiResponse> verifyAndCompleteTransaction(String reference);
    Mono<ApiResponse> processPaymentInBackground(String transactionUuid, String paystackReference);
    Mono<ApiResponse> queuePaymentForBackgroundProcessing(String reference);
    Mono<ApiResponse> markTransactionAsFailed(String transactionUuid, String reason);
    Mono<ApiResponse> completeTransactionWithNotes(String transactionUuid, String paystackPaymentId, String notes, String callbackResponse);
    Mono<ApiResponse> markTransactionAsFailedWithNotes(String transactionUuid, String reason, String callbackResponse);
}