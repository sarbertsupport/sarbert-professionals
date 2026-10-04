package com.albert.microservices.teaching.marketplace.services;

import reactor.core.publisher.Mono;

import java.util.Map;

public interface PaystackService {
    Mono<Map<String, Object>> initializeTransaction(Double amount, String currency,
                                                   String description,
                                                   Map<String, String> metadata, 
                                                   String email,
                                                   String reference,
                                                   String callbackUrl);
    
    Mono<Map<String, Object>> verifyTransaction(String reference);
    
    Mono<Map<String, Object>> chargeCard(Double amount, String currency, 
                                        String description,
                                        Map<String, String> metadata, 
                                        String email,
                                        String authorizationCode,
                                        String reference);
} 