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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * PDF receipt for completed coin purchases only — same template as email attachment ({@code invoiceemail}).
 */
@Service
@RequiredArgsConstructor
public class CoinPurchaseReceiptService {

    private final CoinTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BillingAddressRepository billingAddressRepository;
    private final BusinessAddressRepository businessAddressRepository;
    private final InvoiceDataMapper invoiceDataMapper;
    private final PdfGenerationService pdfGenerationService;

    public Mono<byte[]> generateReceiptPdf(Integer userId, String transactionUuid) {
        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found")))
                .flatMap(tx -> {
                    if (!tx.getUserId().equals(userId)) {
                        return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your transaction"));
                    }
                    if (!isCoinPurchaseEligibleForReceipt(tx)) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Receipt is only available for completed coin purchases"));
                    }
                    return Mono.zip(
                            userRepository.findById(userId)
                                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))),
                            billingAddressRepository.findByUserId(userId)
                                    .defaultIfEmpty(new BillingAddress()),
                            businessAddressRepository.findDefaultAddress()
                                    .defaultIfEmpty(new BusinessAddress())
                    ).map(tuple -> {
                        User user = tuple.getT1();
                        BillingAddress billing = tuple.getT2();
                        BusinessAddress business = tuple.getT3();
                        Map<String, Object> data = invoiceDataMapper.buildInvoiceData(tx, user, billing, business);
                        if (data.get("transactionDate") instanceof LocalDateTime dt) {
                            data.put("formattedDate", dt.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
                        }
                        return pdfGenerationService.generatePdfFromHtml("invoiceemail", data);
                    });
                });
    }

    /**
     * Coin purchases are stored as DEBIT + COMPLETED with a positive fiat {@code amount} (see {@code CoinWalletServiceImpl#processTransaction}).
     */
    public static boolean isCoinPurchaseEligibleForReceipt(CoinTransaction tx) {
        if (tx == null) {
            return false;
        }
        if (!"COMPLETED".equalsIgnoreCase(tx.getStatus())) {
            return false;
        }
        if (!"DEBIT".equalsIgnoreCase(tx.getEntryType())) {
            return false;
        }
        if (tx.getAmount() == null || tx.getAmount() <= 0) {
            return false;
        }
        return true;
    }
}
