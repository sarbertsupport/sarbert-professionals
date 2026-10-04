package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.TeacherSubject;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface TeacherSubjectService {
    Mono<ApiResponse> createTeacherSubject(TeacherSubject teacherSubject);

    Mono<ApiResponse> updateTeacherSubject(Integer teacherId, TeacherSubject teacherSubject);

    Mono<ApiResponse> getTeacherSubjectsByUserId(Integer userId);
}
