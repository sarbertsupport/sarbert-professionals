package com.albert.microservices.teaching.marketplace.configs;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "mpesa")
public class MpesaConfig {
    private String consumerKey;
    private String consumerSecret;
    private String businessShortCode;
    private String passkey;
    private String stkPushUrl;
    /** STK Push Query v2 — includes {@code MpesaReceiptNumber} in successful responses. */
    private String stkPushQueryUrl;
    private String oauthUrl;
    private String callbackUrl;
    /** Overridden via {@code mpesa.transaction-type} — sandbox paybill is usually {@code CustomerPayBillOnline}. */
    private String transactionType = "CustomerPayBillOnline";
    /**
     * Minimum seconds after {@code created_at} before calling STK Query v2 (avoids "too soon" / inconsistent results).
     */
    private int stkQueryMinAgeSeconds = 60;
}
