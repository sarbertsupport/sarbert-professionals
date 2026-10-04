package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.BillingAddress;
import com.albert.microservices.teaching.marketplace.repositories.BillingAddressRepository;
import com.albert.microservices.teaching.marketplace.requests.BillingAddressRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.BillingAddressService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class BillingAddressServiceImpl implements BillingAddressService {

    private static final Logger logger = LoggerFactory.getLogger(BillingAddressServiceImpl.class);

    @Autowired
    private BillingAddressRepository billingAddressRepository;

    @Override
    public Mono<ApiResponse> getBillingAddressByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        return billingAddressRepository.findByUserId(userId)
                .map(billingAddress -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (logger.isDebugEnabled()) {
                        logger.debug("getBillingAddressByUserId ok userId={} reqId={} {}ms",
                                userId, transactionId, duration);
                    }
                    return ApiResponse.createResponse(CODE_SUCCESS, "Billing address retrieved successfully", SUCCESS, billingAddress);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "getBillingAddressByUserId",
                            duration, 404, "Billing address not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "Billing address not found", RECORD_NOT_FOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getBillingAddressByUserId",
                            duration, 500, "Error retrieving billing address",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    public Mono<ApiResponse> saveBillingAddress(Integer userId, BillingAddressRequest request) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId + ", fullName=" + request.getFullName() + ", country=" + request.getCountry();

        BillingAddress billingAddress = new BillingAddress(
            userId, 
            request.getFullName(), 
            request.getCountry(), 
            request.getState(), 
            request.getCity(), 
            request.getAddress(),
                request.getContactNo()
        );
        
        return billingAddressRepository.save(billingAddress)
                .map(savedAddress -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (logger.isDebugEnabled()) {
                        logger.debug("saveBillingAddress ok userId={} reqId={} {}ms", userId, transactionId, duration);
                    }
                    return ApiResponse.createResponse(CODE_SUCCESS, "Billing address saved successfully", SUCCESS, savedAddress);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "saveBillingAddress",
                            duration, 500, "Error saving billing address",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    public Mono<ApiResponse> updateBillingAddress(Integer userId, BillingAddressRequest request) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId + ", fullName=" + request.getFullName() + ", country=" + request.getCountry();

        return billingAddressRepository.findByUserId(userId)
                .flatMap(existingAddress -> {
                    existingAddress.setFullName(request.getFullName());
                    existingAddress.setCountry(request.getCountry());
                    existingAddress.setState(request.getState());
                    existingAddress.setCity(request.getCity());
                    existingAddress.setAddress(request.getAddress());
                    
                    return billingAddressRepository.save(existingAddress);
                })
                .map(updatedAddress -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (logger.isDebugEnabled()) {
                        logger.debug("updateBillingAddress ok userId={} reqId={} {}ms", userId, transactionId, duration);
                    }
                    return ApiResponse.createResponse(CODE_SUCCESS, "Billing address updated successfully", SUCCESS, updatedAddress);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "updateBillingAddress",
                            duration, 404, "Billing address not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "Billing address not found", RECORD_NOT_FOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "updateBillingAddress",
                            duration, 500, "Error updating billing address",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    public Mono<ApiResponse> checkBillingAddressExists(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        return billingAddressRepository.findByUserId(userId)
                .map(billingAddress -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (logger.isDebugEnabled()) {
                        logger.debug("checkBillingAddressExists ok userId={} reqId={} {}ms", userId, transactionId, duration);
                    }
                    return ApiResponse.createResponse(CODE_SUCCESS, "Billing address exists", SUCCESS, true);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "checkBillingAddressExists",
                            duration, 404, "Billing address not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "Billing address not found", RECORD_NOT_FOUND, false));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "checkBillingAddressExists",
                            duration, 500, "Error checking billing address existence",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }
}