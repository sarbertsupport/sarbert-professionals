package com.albert.microservices.teaching.marketplace.controllers;
import com.albert.microservices.teaching.marketplace.entities.Experience;
import com.albert.microservices.teaching.marketplace.requests.UpdateExperience;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.ExperienceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class ExperienceController {
    private final ExperienceService experienceService;

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @PostMapping("/experiences")
    public Mono<ApiResponse> createExperience(@RequestBody @Valid Experience experience) {
        return experienceService.createExperience(experience);
    }

    @PutMapping("/experiences/{experienceId}")
    public Mono<ApiResponse> updateExperience(@PathVariable("experienceId") int experienceId,
                                              @RequestParam Integer userId,
                                              @RequestBody @Valid UpdateExperience experience) {
        return experienceService.updateExperience(experienceId,userId, experience);
    }


    @GetMapping("/experiences")
    public Mono<ApiResponse> getExperiences() {
        return experienceService.getAllExperiences();
    }

    @GetMapping("/experiences/{teacherId}")
    public Mono<ApiResponse> getExperienceByTeacherId(@PathVariable("teacherId") int teacherId) {
        return experienceService.getExperiencesByTeacherId(teacherId);
    }
    @GetMapping("/experiences/teacher/{userId}")
    public Mono<ApiResponse> getExperienceByUserId(@PathVariable("userId") int userId) {
        return experienceService.getExperiencesByUserId(userId);
    }
}
