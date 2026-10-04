package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.BusinessAddress;
import com.albert.microservices.teaching.marketplace.repositories.BusinessAddressRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.BusinessAddressService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
@RequiredArgsConstructor
public class BusinessAddressServiceImpl implements BusinessAddressService {

    private static final Logger logger = LoggerFactory.getLogger(BusinessAddressServiceImpl.class);
    private final BusinessAddressRepository businessAddressRepository;

    @Override
    public Mono<ApiResponse> getAllBusinessAddresses() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getAllBusinessAddresses",
                null, 200, null, "Request to get all business addresses", null);

        return businessAddressRepository.findAllActive()
                .collectList()
                .map(addresses -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getAllBusinessAddresses",
                            duration, 200, "Business addresses retrieved successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Business addresses retrieved successfully", SUCCESS, addresses);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getAllBusinessAddresses",
                            duration, CODE_VALIDATION, "Error retrieving business addresses",
                            e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error retrieving business addresses", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> getBusinessAddressById(Long id) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id=" + id;

        LoggingUtility.logInfo(logger, transactionId, "getBusinessAddressById",
                null, 200, null, requestPayload, null);

        return businessAddressRepository.findById(id)
                .map(address -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getBusinessAddressById",
                            duration, 200, "Business address retrieved successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Business address retrieved successfully", SUCCESS, address);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "getBusinessAddressById",
                            duration, 404, "Business address not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "Business address not found", RECORD_NOT_FOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getBusinessAddressById",
                            duration, CODE_VALIDATION, "Error retrieving business address",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error retrieving business address", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> getDefaultBusinessAddress() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getDefaultBusinessAddress",
                null, 200, null, "Request to get default business address", null);

        return businessAddressRepository.findDefaultAddress()
                .map(address -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getDefaultBusinessAddress",
                            duration, 200, "Default business address retrieved successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Default business address retrieved successfully", SUCCESS, address);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "getDefaultBusinessAddress",
                            duration, 404, "No default business address found",
                            "Not Found", null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "No default business address found", RECORD_NOT_FOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getDefaultBusinessAddress",
                            duration, CODE_VALIDATION, "Error retrieving default business address",
                            e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error retrieving default business address", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> createBusinessAddress(BusinessAddress businessAddress) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "businessName=" + businessAddress.getBusinessName();

        LoggingUtility.logInfo(logger, transactionId, "createBusinessAddress",
                null, 201, null, requestPayload, null);

        businessAddress.setCreatedAt(LocalDateTime.now());
        businessAddress.setUpdatedAt(LocalDateTime.now());

        return businessAddressRepository.save(businessAddress)
                .map(savedAddress -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "createBusinessAddress",
                            duration, 201, "Business address created successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Business address created successfully", SUCCESS, savedAddress);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "createBusinessAddress",
                            duration, CODE_VALIDATION, "Error creating business address",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error creating business address", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> updateBusinessAddress(Long id, BusinessAddress businessAddress) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id=" + id + ", businessName=" + businessAddress.getBusinessName();

        LoggingUtility.logInfo(logger, transactionId, "updateBusinessAddress",
                null, 200, null, requestPayload, null);

        return businessAddressRepository.findById(id)
                .flatMap(existingAddress -> {
                    existingAddress.setBusinessName(businessAddress.getBusinessName());
                    existingAddress.setBusinessDescription(businessAddress.getBusinessDescription());
                    existingAddress.setContactPerson(businessAddress.getContactPerson());
                    existingAddress.setEmail(businessAddress.getEmail());
                    existingAddress.setPhone(businessAddress.getPhone());
                    existingAddress.setAddressLine1(businessAddress.getAddressLine1());
                    existingAddress.setAddressLine2(businessAddress.getAddressLine2());
                    existingAddress.setCity(businessAddress.getCity());
                    existingAddress.setState(businessAddress.getState());
                    existingAddress.setPostalCode(businessAddress.getPostalCode());
                    existingAddress.setCountry(businessAddress.getCountry());
                    existingAddress.setPhysicalLocation(businessAddress.getPhysicalLocation());
                    existingAddress.setWebsite(businessAddress.getWebsite());
                    existingAddress.setTaxId(businessAddress.getTaxId());
                    existingAddress.setRegistrationNumber(businessAddress.getRegistrationNumber());
                    existingAddress.setIsDefault(businessAddress.getIsDefault());
                    existingAddress.setIsActive(businessAddress.getIsActive());
                    existingAddress.setUpdatedAt(LocalDateTime.now());

                    return businessAddressRepository.save(existingAddress);
                })
                .map(updatedAddress -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "updateBusinessAddress",
                            duration, 200, "Business address updated successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Business address updated successfully", SUCCESS, updatedAddress);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "updateBusinessAddress",
                            duration, 404, "Business address not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "Business address not found", RECORD_NOT_FOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "updateBusinessAddress",
                            duration, CODE_VALIDATION, "Error updating business address",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error updating business address", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> deleteBusinessAddress(Long id) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id=" + id;

        LoggingUtility.logInfo(logger, transactionId, "deleteBusinessAddress",
                null, 200, null, requestPayload, null);

        return businessAddressRepository.findById(id)
                .flatMap(address -> businessAddressRepository.deactivateAddress(id))
                .map(result -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "deleteBusinessAddress",
                            duration, 200, "Business address deleted successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Business address deleted successfully", SUCCESS, null);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "deleteBusinessAddress",
                            duration, 404, "Business address not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "Business address not found", RECORD_NOT_FOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "deleteBusinessAddress",
                            duration, CODE_VALIDATION, "Error deleting business address",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error deleting business address", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> setAsDefault(Long id) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id=" + id;

        LoggingUtility.logInfo(logger, transactionId, "setAsDefault",
                null, 200, null, requestPayload, null);

        return businessAddressRepository.findById(id)
                .flatMap(address -> 
                    businessAddressRepository.clearDefaultFlags()
                        .then(businessAddressRepository.setAsDefault(id))
                )
                .map(result -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "setAsDefault",
                            duration, 200, "Business address set as default successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Business address set as default successfully", SUCCESS, null);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "setAsDefault",
                            duration, 404, "Business address not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "Business address not found", RECORD_NOT_FOUND, null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "setAsDefault",
                            duration, CODE_VALIDATION, "Error setting business address as default",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error setting business address as default", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> searchBusinessAddresses(String searchTerm) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "searchTerm=" + searchTerm;

        LoggingUtility.logInfo(logger, transactionId, "searchBusinessAddresses",
                null, 200, null, requestPayload, null);

        return businessAddressRepository.searchByTerm("%" + searchTerm + "%")
                .collectList()
                .map(addresses -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "searchBusinessAddresses",
                            duration, 200, "Business addresses search completed successfully",
                            "Success", null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Business addresses search completed successfully", SUCCESS, addresses);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "searchBusinessAddresses",
                            duration, CODE_VALIDATION, "Error searching business addresses",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Error searching business addresses", e.getMessage(), null));
                });
    }
} 