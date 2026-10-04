package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.Education;
import com.albert.microservices.teaching.marketplace.requests.UpdateEducation;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface EducationService {
    Mono<ApiResponse> createEducation(Education education);
    Mono<ApiResponse> getEducationByTeacherId(Integer teacherId);

    Mono<ApiResponse> getAllEducations();
    Mono<ApiResponse> getEducationByUserId(Integer teacherId);
    Mono<ApiResponse> updateEducation(Integer educationId, Integer userId, UpdateEducation updatedEducation);
}
