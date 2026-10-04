package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.Availability;
import com.albert.microservices.teaching.marketplace.repositories.AvailabilityRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.AvailabilityService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class AvailabilityServiceImpl implements AvailabilityService {
    private static final Logger logger = LoggerFactory.getLogger(AvailabilityServiceImpl.class);
    private final AvailabilityRepository availabilityRepository;

    public AvailabilityServiceImpl(AvailabilityRepository availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    @Override
    public Mono<ApiResponse> createAvailability(Availability availability) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = availability.toString();

        LoggingUtility.logInfo(logger, transactionId, "createAvailability",
                null, 200, null, requestPayload, null);

        return availabilityRepository.findByAvailabilityName(availability.getAvailabilityName())
                .flatMap(existingAvailability -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "createAvailability",
                            duration, CODE_CONFLICT, "Availability already exists",
                            "Conflict", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_CONFLICT, "Availability already exists", CONFLICT, null));
                })
                .switchIfEmpty(availabilityRepository.save(availability)
                        .map(savedAvailability -> {
                            long duration = System.currentTimeMillis() - startTime;
                            LoggingUtility.logInfo(logger, transactionId, "createAvailability",
                                    duration, CODE_SUCCESS, OPERATION_SUCCESS,
                                    null, "");
                            return ApiResponse.createResponse(
                                    CODE_SUCCESS,
                                    OPERATION_SUCCESS,
                                    SUCCESS,
                                    savedAvailability);
                        }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "createAvailability",
                            duration, CODE_SERVER_ERROR, "Error creating availability",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, "Error creating availability", ERROR, null));
                });
    }

    @Override
    public Mono<ApiResponse> getAllAvailabilities() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getAllAvailabilities",
                null, 200, null, null, null);

        return availabilityRepository.findAll()
                .collectList()
                .map(availabilityList -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            availabilityList
                    );
                    LoggingUtility.logInfo(logger, transactionId, "getAllAvailabilities",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return response;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getAllAvailabilities",
                            duration, CODE_SERVER_ERROR, "Error retrieving availabilities",
                            e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, "Error retrieving availabilities", ERROR, null));
                });
    }

    @Override
    public Mono<ApiResponse> updateAvailability(Integer availabilityId, Availability updatedAvailability) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id=" + availabilityId + ", " + updatedAvailability.toString();

        LoggingUtility.logInfo(logger, transactionId, "updateAvailability",
                null, 200, null, requestPayload, null);

        return availabilityRepository.findById(availabilityId)
                .flatMap(existingAvailability -> {
                    existingAvailability.setAvailabilityName(updatedAvailability.getAvailabilityName());

                    return availabilityRepository.save(existingAvailability)
                            .map(savedAvailability -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "updateAvailability",
                                        duration, CODE_SUCCESS, OPERATION_SUCCESS,
                                        null, "");
                                return ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        SUCCESS,
                                        savedAvailability);
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "updateAvailability",
                            duration, CODE_NOT_FOUND, RECORD_NOT_FOUND,
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, RECORD_NOT_FOUND, NOTFOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "updateAvailability",
                            duration, CODE_SERVER_ERROR, "Error updating availability",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, "Error updating availability", ERROR, null));
                });
    }
}