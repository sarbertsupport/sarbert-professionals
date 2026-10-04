package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.StudentProfile;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

public interface StudentProfileService {
    Mono<ApiResponse> uploadImage(FilePart file);

    Mono<ApiResponse> createStudentProfile(StudentProfile studentProfile);

    Mono<ApiResponse> updateStudentProfile(Integer userId, StudentProfile updatedProfile);

    Mono<ApiResponse> getAllStudentProfiles(int page, int size, String fullName, String gender);

    Mono<ApiResponse> getStudentProfileById(Integer studentId);

    Mono<ApiResponse> getStudentProfileByUserId(Integer userId);
}

