package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.Availability;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface AvailabilityService {
     Mono<ApiResponse> createAvailability(Availability availability);
     Mono<ApiResponse> getAllAvailabilities();
     Mono<ApiResponse> updateAvailability(Integer availabilityId, Availability updatedAvailability);
}
