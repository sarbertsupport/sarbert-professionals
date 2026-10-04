package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.BulkDiscount;
import com.albert.microservices.teaching.marketplace.repositories.BulkDiscountRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.BulkDiscountService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@RequiredArgsConstructor
@Service
public class BulkDiscountServiceImpl implements BulkDiscountService {

    private static final Logger logger = LoggerFactory.getLogger(BulkDiscountServiceImpl.class);
    private final BulkDiscountRepository bulkDiscountRepository;

    @Override
    public Mono<ApiResponse> getAllActiveDiscounts() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getAllActiveDiscounts",
                null, CODE_SUCCESS, null, null, null);

        return bulkDiscountRepository.findAllActiveDiscounts()
                .collectList()
                .flatMap(discounts -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getAllActiveDiscounts",
                            duration, CODE_SUCCESS, "Active discounts retrieved successfully",
                            null, "");
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            "Active discounts retrieved successfully",
                            discounts
                    ));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "getAllActiveDiscounts",
                            duration, CODE_NOT_FOUND, "No active discounts available",
                            "Not Found", null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            OPERATION_SUCCESS,
                            "No active discounts available",
                            null
                    ));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getAllActiveDiscounts",
                            duration, CODE_SERVER_ERROR, "Failed to retrieve active discounts",
                            e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Operation failed",
                            "Failed to retrieve active discounts: " + e.getMessage(),
                            null
                    ));
                });
    }

    @Override
    public Mono<ApiResponse> addBulkDiscount(BulkDiscount discount, String username) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = discount.toString() + ", username: " + username;

        LoggingUtility.logInfo(logger, transactionId, "addBulkDiscount",
                null, CODE_SUCCESS, null, requestPayload, null);

        discount.setActive(true);
        discount.setCreatedAt(LocalDateTime.now());
        discount.setUpdatedAt(LocalDateTime.now());
        discount.setCreatedBy(username);
        discount.setUpdatedBy(username);

        return bulkDiscountRepository.save(discount)
                .flatMap(savedDiscount -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "addBulkDiscount",
                            duration, CODE_SUCCESS, "Bulk discount added successfully",
                            null, "");
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            "Bulk discount added successfully",
                            savedDiscount
                    ));
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "addBulkDiscount",
                            duration, CODE_SERVER_ERROR, "Failed to add bulk discount",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Operation failed",
                            "Failed to add bulk discount: " + e.getMessage(),
                            null
                    ));
                });
    }

    @Override
    public Mono<ApiResponse> updateBulkDiscount(Long id, BulkDiscount discountUpdate, String username) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id: " + id + ", update: " + discountUpdate.toString() + ", username: " + username;

        LoggingUtility.logInfo(logger, transactionId, "updateBulkDiscount",
                null, CODE_SUCCESS, null, requestPayload, null);

        return bulkDiscountRepository.findById(id)
                .flatMap(existingDiscount -> {
                    existingDiscount.setMinCoins(discountUpdate.getMinCoins());
                    existingDiscount.setDiscountPercentage(discountUpdate.getDiscountPercentage());
                    existingDiscount.setActive(discountUpdate.getActive());
                    existingDiscount.setUpdatedAt(LocalDateTime.now());
                    existingDiscount.setUpdatedBy(username);

                    return bulkDiscountRepository.save(existingDiscount)
                            .flatMap(updatedDiscount -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "updateBulkDiscount",
                                        duration, CODE_SUCCESS, "Bulk discount updated successfully",
                                        null, "");
                                return Mono.just(ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        "Bulk discount updated successfully",
                                        updatedDiscount
                                ));
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "updateBulkDiscount",
                            duration, CODE_NOT_FOUND, "Bulk discount not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            OPERATION_SUCCESS,
                            "Bulk discount not found with id: " + id,
                            null
                    ));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "updateBulkDiscount",
                            duration, CODE_SERVER_ERROR, "Failed to update bulk discount",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Operation failed",
                            "Failed to update bulk discount: " + e.getMessage(),
                            null
                    ));
                });
    }

    @Override
    public Mono<ApiResponse> deactivateDiscount(Long id, String username) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id: " + id + ", username: " + username;

        LoggingUtility.logInfo(logger, transactionId, "deactivateDiscount",
                null, CODE_SUCCESS, null, requestPayload, null);

        return bulkDiscountRepository.findById(id)
                .flatMap(discount -> {
                    discount.setActive(false);
                    discount.setUpdatedAt(LocalDateTime.now());
                    discount.setUpdatedBy(username);

                    return bulkDiscountRepository.save(discount)
                            .flatMap(updatedDiscount -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "deactivateDiscount",
                                        duration, CODE_SUCCESS, "Discount deactivated successfully",
                                        null, "");
                                return Mono.just(ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        "Discount deactivated successfully",
                                        updatedDiscount
                                ));
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "deactivateDiscount",
                            duration, CODE_NOT_FOUND, "Discount not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            OPERATION_SUCCESS,
                            "Discount not found with id: " + id,
                            null
                    ));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "deactivateDiscount",
                            duration, CODE_SERVER_ERROR, "Failed to deactivate discount",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Operation failed",
                            "Failed to deactivate discount: " + e.getMessage(),
                            null
                    ));
                });
    }

    @Override
    public Mono<ApiResponse> activateDiscount(Long id, String username) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id: " + id + ", username: " + username;

        LoggingUtility.logInfo(logger, transactionId, "activateDiscount",
                null, CODE_SUCCESS, null, requestPayload, null);

        return bulkDiscountRepository.findById(id)
                .flatMap(discount -> {
                    discount.setActive(true);
                    discount.setUpdatedAt(LocalDateTime.now());
                    discount.setUpdatedBy(username);

                    return bulkDiscountRepository.save(discount)
                            .flatMap(updatedDiscount -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "activateDiscount",
                                        duration, CODE_SUCCESS, "Discount activated successfully",
                                        null, "");
                                return Mono.just(ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        "Discount activated successfully",
                                        updatedDiscount
                                ));
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "activateDiscount",
                            duration, CODE_NOT_FOUND, "Discount not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            OPERATION_SUCCESS,
                            "Discount not found with id: " + id,
                            null
                    ));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "activateDiscount",
                            duration, CODE_SERVER_ERROR, "Failed to activate discount",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Operation failed",
                            "Failed to activate discount: " + e.getMessage(),
                            null
                    ));
                });
    }
}