package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.CoinWallet;
import com.albert.microservices.teaching.marketplace.repositories.CoinTransactionRepository;
import com.albert.microservices.teaching.marketplace.repositories.CoinWalletRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
public class TransactionCompletionService {
    private final CoinWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;

    public TransactionCompletionService(CoinWalletRepository walletRepository, CoinTransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }
    public Mono<ApiResponse> completeTransaction(String transactionUuid, String receiptNumber, String paymentMethod) {
        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Transaction not found")))
                .flatMap(transaction -> {
                    transaction.setStatus("COMPLETED");
                    transaction.setUpdatedAt(LocalDateTime.now());

                    if ("MPESA".equals(paymentMethod)) {
                        transaction.setMpesaReceiptNumber(receiptNumber);
                    } else if ("PAYSTACK".equals(paymentMethod) || "CARD".equals(paymentMethod)) {
                        transaction.setStripePaymentId(receiptNumber);
                    }

                    return walletRepository.findByUserId(transaction.getUserId())
                            .switchIfEmpty(createNewWallet(transaction.getUserId()))
                            .flatMap(wallet -> {
                                wallet.addCoins(transaction.getCoins());
                                return walletRepository.save(wallet);
                            })
                            .then(transactionRepository.save(transaction));
                })
                .map(transaction -> ApiResponse.createResponse(200, "Transaction completed", "Success", transaction));
    }

    private Mono<CoinWallet> createNewWallet(Integer userId) {
        return walletRepository.save(new CoinWallet(userId, 0.0));
    }
}
