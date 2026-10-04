package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.BulkDiscount;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface BulkDiscountService {
    Mono<ApiResponse> getAllActiveDiscounts();
    Mono<ApiResponse> addBulkDiscount(BulkDiscount discount, String username);
    Mono<ApiResponse> updateBulkDiscount(Long id, BulkDiscount discountUpdate, String username);
    Mono<ApiResponse> deactivateDiscount(Long id, String username);
    Mono<ApiResponse> activateDiscount(Long id, String username);
}
