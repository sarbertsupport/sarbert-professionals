package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.requests.BillingAddressRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.BillingAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/billing/address")
public class BillingAddressController {

    @Autowired
    private BillingAddressService billingAddressService;

    @PostMapping("/{userId}")
    public Mono<ResponseEntity<ApiResponse>> saveBillingAddress(
            @PathVariable Integer userId,
            @RequestBody BillingAddressRequest request) {
        return billingAddressService.saveBillingAddress(userId, request)
            .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse));
    }

    @GetMapping("/{userId}")
    public Mono<ResponseEntity<ApiResponse>> getBillingAddress(@PathVariable Integer userId) {
        return billingAddressService.getBillingAddressByUserId(userId)
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse));
    }

    @PutMapping("/{userId}")
    public Mono<ResponseEntity<ApiResponse>> updateBillingAddress(
            @PathVariable Integer userId,
            @RequestBody BillingAddressRequest request) {
        return billingAddressService.updateBillingAddress(userId, request)
            .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse));
    }

    @GetMapping("/check/{userId}")
    public Mono<ResponseEntity<ApiResponse>> checkBillingAddressExists(@PathVariable Integer userId) {
        return billingAddressService.checkBillingAddressExists(userId)
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse));
    }
}
