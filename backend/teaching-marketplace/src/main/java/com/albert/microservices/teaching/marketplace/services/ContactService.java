package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface ContactService {
    Mono<ApiResponse> getPhoneNumber(Integer jobId, Integer applicantId);
}
