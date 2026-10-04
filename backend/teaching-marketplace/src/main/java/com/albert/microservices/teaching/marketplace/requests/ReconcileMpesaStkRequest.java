package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReconcileMpesaStkRequest {
    @NotNull
    private Long transactionId;
}
