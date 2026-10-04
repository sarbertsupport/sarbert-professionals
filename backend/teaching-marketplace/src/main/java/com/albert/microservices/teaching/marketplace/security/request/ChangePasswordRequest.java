package com.albert.microservices.teaching.marketplace.security.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String oldPassword;
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters long")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Password must contain: " +
                    "1 uppercase letter, " +
                    "1 lowercase letter, " +
                    "1 number, " +
                    "1 special character (@#$%^&+=!), " +
                    "and no whitespace"
    )
    private String newPassword;
    private String confirmPassword;
}
