package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.TeacherProfile;
import com.albert.microservices.teaching.marketplace.requests.UpdateTeacherProfile;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeacherProfileInfoService;
import com.albert.microservices.teaching.marketplace.services.TeacherProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class TeacherProfileController {
    private final TeacherProfileService teacherProfileService;
    private final TeacherProfileInfoService teacherProfileInfoService;

    public TeacherProfileController(TeacherProfileService teacherProfileService, TeacherProfileInfoService teacherProfileInfoService) {
        this.teacherProfileService = teacherProfileService;
        this.teacherProfileInfoService = teacherProfileInfoService;
    }

    @PostMapping("/profiles/details")
    public Mono<ResponseEntity<ApiResponse>> createTeacherProfile(@RequestBody @Valid TeacherProfile teacherProfile) {
        return teacherProfileService.createTeacherProfile(teacherProfile)
                .map(apiResponse -> new ResponseEntity<>(apiResponse, HttpStatus.valueOf(apiResponse.getHeaders().getResponseCode())));
    }

    @PostMapping("/profiles/upload")
    public Mono<ResponseEntity<?>> uploadImage(@RequestPart("file") FilePart filePart) {
        return teacherProfileService.uploadImage(filePart)
                .map(response -> {
                    if (response.getHeaders().getResponseCode() == 200) {
                        return ResponseEntity.ok(response);
                    } else {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                    }
                });
    }

    @GetMapping("/teachers/profiles")
    public Mono<ApiResponse> getAllTeacherProfiles() {
        return teacherProfileService.getAllTeacherProfiles();
    }

    @GetMapping("/teachers/profiles/all")
    public Mono<ApiResponse> getAllTeachers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String displayName) {
        return teacherProfileService.getAllPaginatedTeachers(page, size, displayName);
    }
    @GetMapping("/profiles/{teacherId}")
    public Mono<ApiResponse> getTeacherProfileById(@PathVariable Integer teacherId) {
        return teacherProfileService.getTeacherProfileById(teacherId);
    }

    @PutMapping("/profiles/{userId}")
    public Mono<ApiResponse> updateTeacherProfile(@PathVariable Integer userId, @RequestBody @Valid UpdateTeacherProfile updatedProfile) {
        return teacherProfileService.updateTeacherProfile(userId, updatedProfile);
    }

    @GetMapping("/teachers/profile/details/{teacherId}")
    public Mono<ApiResponse> getTeacherProfile(@PathVariable Long teacherId) {
        return teacherProfileInfoService.getTeacherById(teacherId);
    }
    @GetMapping("/profiles/user/{userId}")
    public Mono<ApiResponse> getTeacherProfileByUser(@PathVariable Integer userId) {
        return teacherProfileInfoService.getTeacherDetailsByUserId(userId);
    }
}
