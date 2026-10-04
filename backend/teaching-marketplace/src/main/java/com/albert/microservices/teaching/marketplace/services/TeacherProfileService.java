package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.TeacherProfile;
import com.albert.microservices.teaching.marketplace.requests.UpdateTeacherProfile;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

public interface TeacherProfileService {
    Mono<ApiResponse> uploadImage(FilePart file);
    Mono<ApiResponse> createTeacherProfile(TeacherProfile teacherProfile) ;
    Mono<ApiResponse> updateTeacherProfile(Integer teacherId, UpdateTeacherProfile updatedProfile);
    Mono<ApiResponse> getAllTeacherProfiles();
    Mono<ApiResponse> getTeacherProfileById(Integer teacherId);
    Mono<ApiResponse> getAllPaginatedTeachers(int page, int size,String displayName);
    }
