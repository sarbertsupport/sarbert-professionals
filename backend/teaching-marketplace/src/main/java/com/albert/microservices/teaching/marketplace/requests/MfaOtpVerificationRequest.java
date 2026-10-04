package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MfaOtpVerificationRequest {

    @NotBlank
    @Size(min = 64, max = 64)
    private String sessionToken;

    @NotBlank
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
    private String otp;
}
