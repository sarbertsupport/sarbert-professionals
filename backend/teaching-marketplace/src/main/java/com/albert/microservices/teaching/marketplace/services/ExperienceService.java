package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.Experience;
import com.albert.microservices.teaching.marketplace.requests.UpdateExperience;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface ExperienceService {
    Mono<ApiResponse> createExperience(Experience experience);
    Mono<ApiResponse> getExperiencesByTeacherId(Integer teacherId);

    Mono<ApiResponse> getAllExperiences();
     Mono<ApiResponse> getExperiencesByUserId(Integer userId);
    Mono<ApiResponse> updateExperience(Integer experienceId,Integer userId, UpdateExperience updatedExperience);
}
