package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.Ratings;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface RatingService {
    Mono<ApiResponse> createRating(Ratings review);

    Mono<ApiResponse> getAverageRatingByTeacherId(Integer teacherId);

    Mono<ApiResponse> getAllRatingsByTeacherId(Integer teacherId);
}
