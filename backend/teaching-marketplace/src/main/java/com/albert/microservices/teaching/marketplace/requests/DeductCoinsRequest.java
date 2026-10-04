package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DeductCoinsRequest {

    @NotNull(message = "Coins cannot be null")
    @Min(value = 1, message = "At least 1 coin must be deducted")
    private Integer coins;

    @NotBlank(message = "Reason cannot be blank")
    @Size(min = 5, max = 300, message = "Reason must be between 5-300 characters")
    private String reason;

    @NotNull(message = "Job ID cannot be null")
    @Positive(message = "Job ID must be a positive number")
    private Long jobId;
}