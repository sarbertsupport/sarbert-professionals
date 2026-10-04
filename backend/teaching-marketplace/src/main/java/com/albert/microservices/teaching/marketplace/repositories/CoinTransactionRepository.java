    package com.albert.microservices.teaching.marketplace.repositories;

    import com.albert.microservices.teaching.marketplace.entities.CoinTransaction;
    import org.springframework.data.r2dbc.repository.Modifying;
    import org.springframework.data.r2dbc.repository.Query;
    import org.springframework.data.repository.query.Param;
    import org.springframework.data.repository.reactive.ReactiveCrudRepository;
    import org.springframework.stereotype.Repository;
    import reactor.core.publisher.Flux;
    import reactor.core.publisher.Mono;

    import java.time.LocalDateTime;
    import java.util.List;

    @Repository
    public interface CoinTransactionRepository extends ReactiveCrudRepository<CoinTransaction, Long> {
        Flux<CoinTransaction> findByUserIdOrderByCreatedAtDesc(Integer userId);
        Flux<CoinTransaction> findAllByOrderByCreatedAtDesc();
        Mono<CoinTransaction> findByTransactionUuid(String transactionUuid);
        Mono<CoinTransaction> findByMpesaCheckoutRequestId(String checkoutRequestId);
        
        @Query("""
        SELECT COUNT(*) FROM coin_transactions 
        WHERE user_id = :userId 
        AND amount = :amount 
        AND coins = :coins 
        AND status = :status 
        AND created_at > :createdAfter
        AND payment_method = 'MPESA'
    """)
        Mono<Long> countByUserIdAndAmountAndCoinsAndStatusAndCreatedAtAfter(
                Integer userId,
                Double amount,
                Integer coins,
                String status,
                LocalDateTime createdAfter
        );
        Mono<Boolean> existsByIdempotencyKey(String idempotencyKey);
        Mono<CoinTransaction> findByIdempotencyKey(String idempotencyKey);
        Flux<CoinTransaction> findByStatusAndEntryTypeAndInvoiceEmailSent(
                String status,
                String entryType,
                Boolean invoiceEmailSent
        );

        @Modifying
        @Query("UPDATE coin_transactions SET invoice_email_sent = true WHERE id = :id")
        Mono<Integer> markInvoiceEmailSent(@Param("id") Long id);
        
        Mono<CoinTransaction> findByPaystackReference(String paystackReference);
        
        // Find pending transactions with Paystack references for background processing
        @Query("SELECT * FROM coin_transactions WHERE status = :status AND paystack_reference IS NOT NULL")
        Flux<CoinTransaction> findByStatusAndPaystackReferenceIsNotNull(@Param("status") String status);
    }