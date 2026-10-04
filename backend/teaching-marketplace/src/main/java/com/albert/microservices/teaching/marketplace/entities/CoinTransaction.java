package com.albert.microservices.teaching.marketplace.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("coin_transactions")
@Data
public class CoinTransaction {
    @Id
    private Long id;
    private Integer userId;
    private String transactionUuid = UUID.randomUUID().toString();
    private Double amount;
    private String currency;
    private String stripePaymentId;

    private String mpesaReceiptNumber;
    private String mpesaPhoneNumber;
    private String mpesaCheckoutRequestId;
    private String mpesaMerchantRequestId;
    private String description;
    @Column("status")
    private String status;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private int coins;
    @Column("entry_type")
    private String entryType;
    /** Stored rail: {@code MPESA}, {@code CARD} (Paystack), or {@code WALLET} (in-app coin spend, e.g. job apply). */
    @Column("payment_method")
    private String paymentMethod;
    @Column("idempotency_key")
    private String idempotencyKey;
    @Column("paystack_reference")
    private String paystackReference;
    @Column("invoice_email_sent")
    private Boolean invoiceEmailSent = false;
    
    // New fields for better payment tracking
    @Column("notes")
    private String notes;
    @Column("callback_response")
    private String callbackResponse;

    @Column("mpesa_result_code")
    private String mpesaResultCode;
    @Column("mpesa_result_desc")
    private String mpesaResultDesc;
    @Column("mpesa_last_stk_query_at")
    private LocalDateTime mpesaLastStkQueryAt;
    @Column("mpesa_stk_query_response")
    private String mpesaStkQueryResponse;
    
    // Retry mechanism fields
    @Column("retry_count")
    private Integer retryCount = 0;
    @Column("max_retries")
    private Integer maxRetries = 3;
}
