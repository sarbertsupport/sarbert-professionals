package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.BusinessAddress;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface BusinessAddressService {
    Mono<ApiResponse> getAllBusinessAddresses();
    Mono<ApiResponse> getBusinessAddressById(Long id);
    Mono<ApiResponse> getDefaultBusinessAddress();
    Mono<ApiResponse> createBusinessAddress(BusinessAddress businessAddress);
    Mono<ApiResponse> updateBusinessAddress(Long id, BusinessAddress businessAddress);
    Mono<ApiResponse> deleteBusinessAddress(Long id);
    Mono<ApiResponse> setAsDefault(Long id);
    Mono<ApiResponse> searchBusinessAddresses(String searchTerm);
} 