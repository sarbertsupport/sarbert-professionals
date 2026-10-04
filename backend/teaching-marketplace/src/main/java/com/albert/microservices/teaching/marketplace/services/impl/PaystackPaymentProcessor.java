package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.CoinTransaction;
import com.albert.microservices.teaching.marketplace.repositories.CoinTransactionRepository;
import com.albert.microservices.teaching.marketplace.services.CoinWalletService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Polls pending Paystack-backed coin purchases. Logging is intentionally quiet at INFO:
 * one summary line per scheduler tick; per-reference detail is DEBUG/WARN/ERROR only.
 */
@Service
@RequiredArgsConstructor
public class PaystackPaymentProcessor {
    private static final Logger logger = LoggerFactory.getLogger(PaystackPaymentProcessor.class);

    private final CoinTransactionRepository transactionRepository;
    private final CoinWalletService coinWalletService;

    @Scheduled(fixedDelay = 15000)
    public void processPendingPaystackPayments() {
        long batchStart = System.currentTimeMillis();
        transactionRepository.findByStatusAndPaystackReferenceIsNotNull("PENDING")
                .collectList()
                .flatMap(pending -> {
                    if (pending.isEmpty()) {
                        logger.trace("Paystack scheduler: no PENDING rows with paystack_reference");
                        return Mono.<Void>empty();
                    }
                    AtomicInteger verifiedOk = new AtomicInteger(0);
                    AtomicInteger needsAttention = new AtomicInteger(0);
                    logger.debug("Paystack scheduler: verifying {} pending payment(s)", pending.size());
                    return Flux.fromIterable(pending)
                            .concatMap(tx -> verifyOnePending(tx, verifiedOk, needsAttention))
                            .then(Mono.fromRunnable(() -> {
                                long ms = System.currentTimeMillis() - batchStart;
                                int ok = verifiedOk.get();
                                int att = needsAttention.get();
                                if (att > 0) {
                                    logger.warn(
                                            "Paystack scheduler: batch in {}ms — items={}, ok={}, needsAttention={} (see WARN/ERROR above per reference)",
                                            ms, pending.size(), ok, att);
                                } else {
                                    logger.trace(
                                            "Paystack scheduler: batch in {}ms — items={}, all processed without attention flags",
                                            ms, pending.size());
                                }
                            }))
                            .then();
                })
                .subscribe(
                        null,
                        e -> logger.error("Paystack scheduler tick failed: {}", e.toString(), e)
                );
    }

    private Mono<Void> verifyOnePending(CoinTransaction transaction, AtomicInteger verifiedOk, AtomicInteger needsAttention) {
        String ref = transaction.getPaystackReference();
        String uuid = transaction.getTransactionUuid();
        return coinWalletService.processPaymentInBackground(uuid, ref)
                .doOnSuccess(response -> {
                    if (response == null || response.getHeaders() == null) {
                        needsAttention.incrementAndGet();
                        logger.warn("Paystack verify: empty API response transactionUuid={} reference={}", uuid, ref);
                        return;
                    }
                    int code = response.getHeaders().getResponseCode();
                    String responseMessage = response.getHeaders().getResponseMessage();
                    if ("VERIFY_RETRY".equals(responseMessage)) {
                        logger.debug("Paystack verify deferred retry reference={} detail={}",
                                ref, response.getHeaders().getCustomerMessage());
                        return;
                    }
                    if (code >= 200 && code < 300) {
                        verifiedOk.incrementAndGet();
                        logger.debug("Paystack verify OK reference={} code={}", ref, code);
                    } else if (code >= 400 && code < 500) {
                        needsAttention.incrementAndGet();
                        logger.warn("Paystack verify outcome reference={} code={} message={}",
                                ref, code, response.getHeaders().getCustomerMessage());
                    } else {
                        needsAttention.incrementAndGet();
                        logger.error("Paystack verify failed reference={} code={} message={}",
                                ref, code, response.getHeaders().getCustomerMessage());
                    }
                })
                .onErrorResume(e -> {
                    needsAttention.incrementAndGet();
                    logger.error("Paystack verify error reference={} transactionUuid={}: {}",
                            ref, uuid, e.getMessage());
                    return Mono.empty();
                })
                .then();
    }
}
