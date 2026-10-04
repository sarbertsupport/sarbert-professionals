package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.Experience;
import com.albert.microservices.teaching.marketplace.entities.TeachingDetail;
import com.albert.microservices.teaching.marketplace.requests.UpdateTeachingDetails;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeachingDetailService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class TeachingDetailController {
    private final TeachingDetailService teachingDetailService;

    public TeachingDetailController(TeachingDetailService teachingDetailService) {
        this.teachingDetailService = teachingDetailService;
    }

    @GetMapping("/teaching/details")
    public Mono<ApiResponse> getDetails() {
        return teachingDetailService.getAllTeachingDetails();
    }

    @GetMapping("/teaching/details/{teacherId}")
    public Mono<ApiResponse> getTeacherDetails(@PathVariable("teacherId") int teacherId) {
        return teachingDetailService.getTeachingDetailByTeacherId(teacherId);
    }
    @GetMapping("/teaching/details/teacher/{userId}")
    public Mono<ApiResponse> getTeacherDetailsByUser(@PathVariable("userId") int userId) {
        return teachingDetailService.getTeachingDetailByUserId(userId);
    }

    @PostMapping("/teaching/details")
    public Mono<ApiResponse> createTeachingDetails(@RequestBody TeachingDetail teachingDetail) {
        return teachingDetailService.createTeachingDetail(teachingDetail);
    }

    @PutMapping("/teaching/details/{id}")
    public Mono<ApiResponse> createTeachingDetails(@PathVariable("id") int id,
                                                   @RequestParam Integer userId,
                                                   @RequestBody UpdateTeachingDetails teachingDetail) {
        return teachingDetailService.updateTeachingDetail(id,userId, teachingDetail);
    }



}
