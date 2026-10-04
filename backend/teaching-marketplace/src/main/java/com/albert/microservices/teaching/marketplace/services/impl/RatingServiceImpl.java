package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.Ratings;
import com.albert.microservices.teaching.marketplace.repositories.RatingsRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.RatingService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class RatingServiceImpl implements RatingService {
    private static final Logger logger = LoggerFactory.getLogger(RatingServiceImpl.class);
    private static final String PROCESS_NAME = "RatingService";

    private final RatingsRepository ratingRepository;

    public RatingServiceImpl(RatingsRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    @Override
    public Mono<ApiResponse> createRating(Ratings review) {
        String transactionId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();

        LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null,
                CODE_SUCCESS, "Starting to create rating",
                review != null ? review.toString() : "null", null);

        // Check if the provided review data is valid
        if (review == null || review.getTeacherId() == null || review.getStudentId() == null || review.getRating() == null) {
            long duration = Duration.between(startTime, Instant.now()).toMillis();
            LoggingUtility.logWarn(logger, transactionId, PROCESS_NAME, duration,
                    CODE_VALIDATION, "Invalid review data provided",
                    "Missing required fields", review != null ? review.toString() : "null", null);

            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Invalid review data provided",
                    BAD_REQUEST,
                    null));
        }

        // Validate that the rating is between 1 and 5
        if (review.getRating() < 1 || review.getRating() > 5) {
            long duration = Duration.between(startTime, Instant.now()).toMillis();
            LoggingUtility.logWarn(logger, transactionId, PROCESS_NAME, duration,
                    CODE_VALIDATION, "Invalid rating value",
                    "Rating must be between 1 and 5", review.toString(), null);

            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Rating must be between 1 and 5",
                    BAD_REQUEST,
                    null));
        }

        // Check if the student has already rated the teacher
        return ratingRepository.existsByTeacherIdAndStudentId(review.getTeacherId(), review.getStudentId())
                .flatMap(exists -> {
                    if (exists) {
                        long duration = Duration.between(startTime, Instant.now()).toMillis();
                        LoggingUtility.logWarn(logger, transactionId, PROCESS_NAME, duration,
                                CODE_CONFLICT, "Duplicate rating attempt",
                                "Student has already rated this teacher", review.toString(), null);

                        return Mono.just(ApiResponse.createResponse(
                                CODE_CONFLICT,
                                "Student has already rated this teacher",
                                CONFLICT,
                                null));
                    } else {
                        return ratingRepository.save(review)
                                .map(savedReview -> {
                                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, duration,
                                            CODE_SUCCESS, "Rating created successfully",
                                            null, "");

                                    return ApiResponse.createResponse(
                                            CODE_SUCCESS,
                                            "Rating created successfully",
                                            SUCCESS,
                                            savedReview);
                                })
                                .doOnError(e -> {
                                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                                            CODE_SERVER_ERROR, "Error creating rating",
                                            e.getMessage(), review.toString(), null);
                                });
                    }
                })
                .doOnError(e -> {
                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SERVER_ERROR, "Error checking rating existence",
                            e.getMessage(), review.toString(), null);
                });
    }

    @Override
    public Mono<ApiResponse> getAverageRatingByTeacherId(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();

        LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null,
                CODE_SUCCESS, "Starting to calculate average rating",
                "teacherId: " + teacherId, null);

        return ratingRepository.findByTeacherId(teacherId)
                .collectList()
                .flatMap(ratings -> {
                    if (ratings.isEmpty()) {
                        long duration = Duration.between(startTime, Instant.now()).toMillis();
                        LoggingUtility.logWarn(logger, transactionId, PROCESS_NAME, duration,
                                CODE_NOT_FOUND, "No ratings found",
                                "No ratings found for teacher", "teacherId: " + teacherId, null);

                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "No ratings found for the teacher",
                                NOTFOUND,
                                null));
                    }

                    // Calculate the average rating
                    double averageRating = ratings.stream()
                            .mapToDouble(Ratings::getRating)
                            .average()
                            .orElse(0);

                    // Format average rating to one decimal place
                    double roundedAverageRating = Math.round(averageRating * 10.0) / 10.0;

                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SUCCESS, "Average rating calculated",
                            null, "");

                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Average rating calculated successfully",
                            SUCCESS,
                            roundedAverageRating));
                })
                .doOnError(e -> {
                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SERVER_ERROR, "Error calculating average rating",
                            e.getMessage(), "teacherId: " + teacherId, null);
                });
    }

    @Override
    public Mono<ApiResponse> getAllRatingsByTeacherId(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();

        LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null,
                CODE_SUCCESS, "Starting to fetch all ratings",
                "teacherId: " + teacherId, null);

        return ratingRepository.findByTeacherId(teacherId)
                .collectList()
                .flatMap(ratings -> {
                    if (ratings.isEmpty()) {
                        long duration = Duration.between(startTime, Instant.now()).toMillis();
                        LoggingUtility.logWarn(logger, transactionId, PROCESS_NAME, duration,
                                CODE_NOT_FOUND, "No ratings found",
                                "No ratings found for teacher", "teacherId: " + teacherId, null);

                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "No ratings found for the teacher",
                                NOTFOUND,
                                null));
                    }

                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SUCCESS, "Ratings fetched successfully",
                            null, "");

                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Ratings fetched successfully",
                            SUCCESS,
                            ratings));
                })
                .doOnError(e -> {
                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SERVER_ERROR, "Error fetching ratings",
                            e.getMessage(), "teacherId: " + teacherId, null);
                });
    }
}