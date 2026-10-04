package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface TeacherService {
    Mono<ApiResponse> getAllTeachersBasicInfo(int page, int size,
                                              String gender, Double minFee, Double maxFee,
                                              Boolean onlineAvailability, Boolean homeAvailability,
                                              Integer subjectId);

    Mono<ApiResponse> getTeacherProfile(Integer teacherId);
}
