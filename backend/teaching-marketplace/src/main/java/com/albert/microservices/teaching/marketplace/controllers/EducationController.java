package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.Education;
import com.albert.microservices.teaching.marketplace.requests.UpdateEducation;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.EducationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class EducationController {
    private final EducationService educationService;

    public EducationController(EducationService educationService) {
        this.educationService = educationService;
    }
    @GetMapping("/teachers/education")
    public Mono<ApiResponse> getAllEducations() {
        return educationService.getAllEducations();
    }

    @GetMapping("/teachers/education/{teacherId}")
    public Mono<ApiResponse> getEducationByTeacherId(@PathVariable Integer teacherId) {
        return educationService.getEducationByTeacherId(teacherId);
    }
    @GetMapping("/teachers/education/users/{userId}")
    public Mono<ApiResponse> getEducationByUserId(@PathVariable Integer userId) {
        return educationService.getEducationByUserId(userId);
    }

    @PostMapping("/teachers/education")
    public Mono<ApiResponse> createEducation(@RequestBody @Valid Education education) {
        return educationService.createEducation(education);
    }

    @PutMapping("/teachers/education/{educationId}")
    public Mono<ApiResponse> updateEducation(@PathVariable Integer educationId,
                                             @RequestParam Integer userId,
                                             @RequestBody @Valid UpdateEducation updatedEducation) {
        return educationService.updateEducation(educationId, userId, updatedEducation);
    }
}
