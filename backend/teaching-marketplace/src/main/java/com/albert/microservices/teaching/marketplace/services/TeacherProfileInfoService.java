package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface TeacherProfileInfoService {
    Mono<ApiResponse> getAllTeachers();

    Mono<ApiResponse> getTeacherById(Long teacherId);
    Mono<ApiResponse> getTeacherDetailsByUserId(Integer userId);

}
