package com.albert.microservices.teaching.marketplace.security.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Integer userId;
    private String username;
    private String email;
    private Boolean activeStatus;
    private Integer loginAttempts;
    private LocalDateTime lastLoginAttempt;
    private Boolean locked;
    private String roleName;
    private String currentStep;
    private LocalDateTime createdAt;
}
