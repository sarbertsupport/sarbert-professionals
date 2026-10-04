package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.StudentProfile;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/student-profiles")
public class StudentProfileController {
    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @PostMapping("/upload-image")
    public Mono<ResponseEntity<ApiResponse>> uploadImage(@RequestPart("file") FilePart file) {
        return studentProfileService.uploadImage(file)
                .map(ResponseEntity::ok);
    }

    @PostMapping
    public Mono<ResponseEntity<ApiResponse>> createStudentProfile(@RequestBody @Valid StudentProfile studentProfile) {
        return studentProfileService.createStudentProfile(studentProfile)
                .map(ResponseEntity::ok);
    }

    @PutMapping("/{userId}")
    public Mono<ResponseEntity<ApiResponse>> updateStudentProfile(
            @PathVariable Integer userId,
            @RequestBody @Valid StudentProfile updatedProfile) {
        return studentProfileService.updateStudentProfile(userId, updatedProfile)
                .map(ResponseEntity::ok);
    }

    @GetMapping
    public Mono<ApiResponse> getAllStudentProfiles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String gender) {
        return studentProfileService.getAllStudentProfiles(page, size, fullName, gender);
    }

    @GetMapping("/{studentId}")
    public Mono<ResponseEntity<ApiResponse>> getStudentProfileById(@PathVariable Integer studentId) {
        return studentProfileService.getStudentProfileById(studentId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/user/{userId}")
    public Mono<ResponseEntity<ApiResponse>> getStudentProfileByUserId(@PathVariable Integer userId) {
        return studentProfileService.getStudentProfileByUserId(userId)
                .map(ResponseEntity::ok);
    }
}
