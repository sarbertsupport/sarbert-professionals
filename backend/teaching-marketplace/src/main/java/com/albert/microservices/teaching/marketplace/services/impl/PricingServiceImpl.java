package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.Pricing;
import com.albert.microservices.teaching.marketplace.repositories.PricingRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.PricingService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.CODE_SUCCESS;
import static com.albert.microservices.teaching.marketplace.utils.Constants.OPERATION_SUCCESS;
import static com.albert.microservices.teaching.marketplace.utils.Constants.SUCCESS;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private static final Logger logger = LoggerFactory.getLogger(PricingServiceImpl.class);
    private final PricingRepository pricingRepository;

    @Override
    public Mono<ApiResponse> getCurrentPricing() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getCurrentPricing";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Fetching current pricing", null, null);

        return pricingRepository.findCurrentPricing()
                .flatMap(pricing -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                            "Current pricing fetched successfully", null, "");
                    return Mono.just(
                            ApiResponse.createResponse(
                                    CODE_SUCCESS,
                                    OPERATION_SUCCESS,
                                    SUCCESS,
                                    pricing
                            )
                    );
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration,
                            HttpStatus.NOT_FOUND.value(),
                            "No pricing information available",
                            "Pricing data not found",
                            null,
                            null);
                    return Mono.just(
                            ApiResponse.createResponse(
                                    HttpStatus.NOT_FOUND.value(),
                                    "No pricing information available",
                                    "Not Found",
                                    null
                            )
                    );
                }));
    }

    @Override
    public Mono<ApiResponse> addPricing(Pricing pricing, String username) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "addPricing";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Adding new pricing", pricing.toString(), null);

        pricing.setCreatedAt(LocalDateTime.now());
        pricing.setUpdatedAt(LocalDateTime.now());
        pricing.setCreatedBy(username);
        pricing.setUpdatedBy(username);

        return pricingRepository.save(pricing)
                .flatMap(savedPricing -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                            "Pricing added successfully", null, "");
                    return Mono.just(
                            ApiResponse.createResponse(
                                    CODE_SUCCESS,
                                    OPERATION_SUCCESS,
                                    SUCCESS,
                                    savedPricing
                            )
                    );
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Failed to add pricing",
                            e.getMessage(),
                            pricing.toString(),
                            null);
                    return Mono.just(
                            ApiResponse.createResponse(
                                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                    "Failed to add pricing: " + e.getMessage(),
                                    "Error",
                                    null
                            )
                    );
                });
    }

    @Override
    public Mono<ApiResponse> updatePricing(Long id, Pricing pricingUpdate, String username) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "updatePricing";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Updating pricing", "ID: " + id + ", Update: " + pricingUpdate.toString(), null);

        return pricingRepository.findById(id)
                .flatMap(existingPricing -> {
                    existingPricing.setBasePricePerCoin(pricingUpdate.getBasePricePerCoin());
                    existingPricing.setUpdatedAt(LocalDateTime.now());
                    existingPricing.setUpdatedBy(username);

                    return pricingRepository.save(existingPricing)
                            .flatMap(updatedPricing -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                                        "Pricing updated successfully", null, "");
                                return Mono.just(
                                        ApiResponse.createResponse(
                                                CODE_SUCCESS,
                                                OPERATION_SUCCESS,
                                                SUCCESS,
                                                updatedPricing
                                        )
                                );
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration,
                            HttpStatus.NOT_FOUND.value(),
                            "Pricing not found",
                            "Pricing not found with id: " + id,
                            null,
                            null);
                    return Mono.just(
                            ApiResponse.createResponse(
                                    HttpStatus.NOT_FOUND.value(),
                                    "Pricing not found with id: " + id,
                                    "Not Found",
                                    null
                            )
                    );
                }));
    }
}