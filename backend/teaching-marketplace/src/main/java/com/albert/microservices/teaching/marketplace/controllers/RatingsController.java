package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.Ratings;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.RatingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class RatingsController {
    private final RatingService ratingService;

    public RatingsController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping("/ratings/create")
    public Mono<ApiResponse> createRating(@RequestBody @Valid Ratings ratings) {
        return ratingService.createRating(ratings);
    }

    @GetMapping("/ratings/{teacherId}")
    public Mono<ApiResponse> getTeacherRatings(@PathVariable("teacherId") int teacherId) {
        return ratingService.getAllRatingsByTeacherId(teacherId);
    }

    @GetMapping("/ratings/avg/{teacherId}")
    public Mono<ApiResponse> getTeacherAverageRatings(@PathVariable("teacherId") int teacherId) {
        return ratingService.getAverageRatingByTeacherId(teacherId);
    }
}
