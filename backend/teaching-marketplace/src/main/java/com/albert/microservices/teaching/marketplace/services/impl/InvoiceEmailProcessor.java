package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.BillingAddress;
import com.albert.microservices.teaching.marketplace.entities.BusinessAddress;
import com.albert.microservices.teaching.marketplace.entities.CoinTransaction;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.repositories.BillingAddressRepository;
import com.albert.microservices.teaching.marketplace.repositories.BusinessAddressRepository;
import com.albert.microservices.teaching.marketplace.repositories.CoinTransactionRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.services.InvoiceDataMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoiceEmailProcessor {
    private static final Logger logger = LoggerFactory.getLogger(InvoiceEmailProcessor.class);

    private final CoinTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BillingAddressRepository billingAddressRepository;
    private final BusinessAddressRepository businessAddressRepository;
    private final InvoiceEmailService invoiceEmailService;
    private final InvoiceDataMapper invoiceDataMapper;

    @Scheduled(fixedDelay = 30000) // Run every 30 seconds
    public void processPendingInvoiceEmails() {
        transactionRepository.findByStatusAndEntryTypeAndInvoiceEmailSent(
                "COMPLETED", "DEBIT", false
        )
                .flatMap(transaction ->
                        Mono.zip(
                                userRepository.findById(transaction.getUserId()),
                                billingAddressRepository.findByUserId(transaction.getUserId())
                                        .defaultIfEmpty(new BillingAddress()),
                                businessAddressRepository.findDefaultAddress()
                                        .defaultIfEmpty(new BusinessAddress())
                        )
                                .flatMap(tuple -> {
                                    User user = tuple.getT1();
                                    BillingAddress billingAddress = tuple.getT2();
                                    BusinessAddress businessAddress = tuple.getT3();
                                    
                                    Map<String, Object> invoiceData = invoiceDataMapper.buildInvoiceData(
                                            transaction, user, billingAddress, businessAddress);
                                    
                                    return invoiceEmailService.sendInvoiceEmail(invoiceData, user.getEmail())
                                            .then(transactionRepository.markInvoiceEmailSent(transaction.getId()));
                                })
                )
                .subscribe();
    }
}
