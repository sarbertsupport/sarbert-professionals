package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CoinPurchaseRequest {

    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    @Digits(integer = 6, fraction = 2, message = "Amount must have max 6 integer and 2 fraction digits")
    private Double amount;

    @NotBlank(message = "Currency cannot be blank")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be in ISO 4217 format (e.g., USD, EUR)")
    private String currency;

    @NotBlank(message = "Card token cannot be blank")
    @Size(min =10, max = 50, message = "Card token must be between 20-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Card token contains invalid characters")
    private String cardToken;

    @Min(value = 1, message = "Number of coins must be at least 1")
    private int numberOfCoins;

    @NotNull(message = "Billing address cannot be null")
    @Valid
    private BillingAddressRequest billingAddress;
}