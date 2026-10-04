package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.requests.BillingAddressRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface BillingAddressService {
    Mono<ApiResponse> getBillingAddressByUserId(Integer userId);
    Mono<ApiResponse> saveBillingAddress(Integer userId, BillingAddressRequest request);
    Mono<ApiResponse> updateBillingAddress(Integer userId, BillingAddressRequest request);
    Mono<ApiResponse> checkBillingAddressExists(Integer userId);
}
