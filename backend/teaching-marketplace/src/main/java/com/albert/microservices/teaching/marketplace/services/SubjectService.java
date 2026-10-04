package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.Subject;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface SubjectService {
    Mono<ApiResponse> createSubject(Subject subject);
    Mono<ApiResponse> updateSubject(Integer subjectId, Subject updatedSubject);
    Mono<ApiResponse> getAllSubjects();
}
