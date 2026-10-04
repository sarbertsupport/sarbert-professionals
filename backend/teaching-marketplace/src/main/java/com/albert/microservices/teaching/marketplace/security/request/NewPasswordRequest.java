package com.albert.microservices.teaching.marketplace.security.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NewPasswordRequest {
    private String token;
    private String newPassword;
    private String confirmPassword;
}
