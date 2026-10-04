package com.albert.microservices.teaching.marketplace.exception;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomAuthenticationException extends RuntimeException {
    private final String responseCode;
    private final String responseMessage;
    private final String customerMessage;

    public CustomAuthenticationException(String responseCode, String responseMessage, String customerMessage) {
        this.responseCode = responseCode;
        this.responseMessage = responseMessage;
        this.customerMessage = customerMessage;

    }
}