package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface ProfileDetailsService {
    Mono<ApiResponse> getTeacherProfile(Integer teacherId);
}
