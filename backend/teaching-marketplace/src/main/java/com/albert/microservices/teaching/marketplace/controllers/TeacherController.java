package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class TeacherController {
    private final TeacherService teacherService;

    @Autowired
    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/teachers/all")
    public Mono<ApiResponse> getAllTeachers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) Boolean onlineAvailability,
            @RequestParam(required = false) Boolean homeAvailability,
            @RequestParam(required = false) Integer subjectId) {
        int adjustedPage = page - 1;
        return teacherService.getAllTeachersBasicInfo(
                adjustedPage, size, gender, minFee, maxFee,
                onlineAvailability, homeAvailability, subjectId);
    }

    @GetMapping("/teachers/profiles/{teacherId}")
    public Mono<ApiResponse> getTeacherProfile(@PathVariable Integer teacherId) {
        return teacherService.getTeacherProfile(teacherId);
    }
}
