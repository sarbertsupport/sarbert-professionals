package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.TeachingDetail;
import com.albert.microservices.teaching.marketplace.requests.UpdateTeachingDetails;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface TeachingDetailService {
    Mono<ApiResponse> createTeachingDetail(TeachingDetail teachingDetail);
    Mono<ApiResponse> updateTeachingDetail(Integer id,Integer userId, UpdateTeachingDetails updatedTeachingDetail);
    Mono<ApiResponse> getAllTeachingDetails();
    Mono<ApiResponse> getTeachingDetailByTeacherId(Integer teacherId);
    Mono<ApiResponse> getTeachingDetailByUserId(Integer userId);

}
