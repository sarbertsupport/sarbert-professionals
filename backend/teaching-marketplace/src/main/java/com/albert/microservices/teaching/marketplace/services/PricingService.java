package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.Pricing;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface PricingService {
    Mono<ApiResponse> getCurrentPricing();
    Mono<ApiResponse> addPricing(Pricing pricing, String username);
    Mono<ApiResponse> updatePricing(Long id, Pricing pricingUpdate, String username);
}
