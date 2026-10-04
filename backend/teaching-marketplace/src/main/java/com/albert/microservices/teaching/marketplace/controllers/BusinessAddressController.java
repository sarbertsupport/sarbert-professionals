package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.BusinessAddress;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.BusinessAddressService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/business-addresses")
@RequiredArgsConstructor
public class BusinessAddressController {

    private static final Logger logger = LoggerFactory.getLogger(BusinessAddressController.class);
    private final BusinessAddressService businessAddressService;

    // Helper method to check admin role
    private boolean hasAdminRole(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    public Mono<ResponseEntity<ApiResponse>> getAllBusinessAddresses(Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "getAllBusinessAddresses",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to access business addresses", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "getAllBusinessAddresses",
                null, 200, null, "Request to get all business addresses", null);

        return businessAddressService.getAllBusinessAddresses()
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getAllBusinessAddresses",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getAllBusinessAddresses",
                            duration, 500, "Internal server error",
                            e.getMessage(), null, null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse>> getBusinessAddressById(@PathVariable Long id, Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "getBusinessAddressById",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to access business address", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "getBusinessAddressById",
                null, 200, null, "Request to get business address by ID: " + id, null);

        return businessAddressService.getBusinessAddressById(id)
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getBusinessAddressById",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getBusinessAddressById",
                            duration, 500, "Internal server error",
                            e.getMessage(), null, null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }

    @GetMapping("/default")
    public Mono<ResponseEntity<ApiResponse>> getDefaultBusinessAddress(Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "getDefaultBusinessAddress",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to access default business address", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "getDefaultBusinessAddress",
                null, 200, null, "Request to get default business address", null);

        return businessAddressService.getDefaultBusinessAddress()
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getDefaultBusinessAddress",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getDefaultBusinessAddress",
                            duration, 500, "Internal server error",
                            e.getMessage(), null, null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }

    @PostMapping
    public Mono<ResponseEntity<ApiResponse>> createBusinessAddress(@RequestBody BusinessAddress businessAddress, Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "createBusinessAddress",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to create business address", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "createBusinessAddress",
                null, 200, null, "Request to create business address", businessAddress.toString());

        return businessAddressService.createBusinessAddress(businessAddress)
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "createBusinessAddress",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "createBusinessAddress",
                            duration, 500, "Internal server error",
                            e.getMessage(), businessAddress.toString(), null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse>> updateBusinessAddress(@PathVariable Long id, @RequestBody BusinessAddress businessAddress, Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "updateBusinessAddress",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to update business address", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "updateBusinessAddress",
                null, 200, null, "Request to update business address with ID: " + id, businessAddress.toString());

        return businessAddressService.updateBusinessAddress(id, businessAddress)
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "updateBusinessAddress",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "updateBusinessAddress",
                            duration, 500, "Internal server error",
                            e.getMessage(), businessAddress.toString(), null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse>> deleteBusinessAddress(@PathVariable Long id, Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "deleteBusinessAddress",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to delete business address", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "deleteBusinessAddress",
                null, 200, null, "Request to delete business address with ID: " + id, null);

        return businessAddressService.deleteBusinessAddress(id)
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "deleteBusinessAddress",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "deleteBusinessAddress",
                            duration, 500, "Internal server error",
                            e.getMessage(), null, null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }

    @PutMapping("/{id}/set-default")
    public Mono<ResponseEntity<ApiResponse>> setAsDefault(@PathVariable Long id, Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "setAsDefault",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to set business address as default", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "setAsDefault",
                null, 200, null, "Request to set business address as default with ID: " + id, null);

        return businessAddressService.setAsDefault(id)
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "setAsDefault",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "setAsDefault",
                            duration, 500, "Internal server error",
                            e.getMessage(), null, null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<ApiResponse>> searchBusinessAddresses(@RequestParam String q, Authentication auth) {
        String transactionId = java.util.UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Check admin role
        if (!hasAdminRole(auth)) {
            LoggingUtility.logError(logger, transactionId, "searchBusinessAddresses",
                    System.currentTimeMillis() - startTime, 403, "Access denied",
                    "Non-admin user attempted to search business addresses", null, null);
            return Mono.just(ResponseEntity.status(403)
                    .body(ApiResponse.createResponse(403, "Access denied. Admin role required.", null, null)));
        }

        LoggingUtility.logInfo(logger, transactionId, "searchBusinessAddresses",
                null, 200, null, "Request to search business addresses with query: " + q, null);

        return businessAddressService.searchBusinessAddresses(q)
                .map(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "searchBusinessAddresses",
                            duration, response.getHeaders().getResponseCode(), "Response sent successfully",
                            "Success", null);
                    return ResponseEntity.status(response.getHeaders().getResponseCode()).body(response);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "searchBusinessAddresses",
                            duration, 500, "Internal server error",
                            e.getMessage(), null, null);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.createResponse(500, "Internal server error", e.getMessage(), null)));
                });
    }
} 