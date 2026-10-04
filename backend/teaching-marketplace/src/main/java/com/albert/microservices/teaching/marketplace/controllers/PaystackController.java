package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.PaystackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/paystack")
@CrossOrigin(origins = "*")
public class PaystackController {

    private final PaystackService paystackService;

    public PaystackController(PaystackService paystackService) {
        this.paystackService = paystackService;
    }

    @PostMapping("/initialize-transaction")
    public Mono<ResponseEntity<ApiResponse>> initializeTransaction(@RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.valueOf(request.get("amount").toString());
            String email = (String) request.get("email");
            String reference = (String) request.get("reference");
            String callbackUrl = (String) request.get("callbackUrl");
            String currency = (String) request.get("currency");
            
            // Extract metadata
            @SuppressWarnings("unchecked")
            Map<String, String> metadata = (Map<String, String>) request.get("metadata");
            
            // Set default callback URL if not provided
            if (callbackUrl == null || callbackUrl.isEmpty()) {
                callbackUrl = "http://localhost:3000/success";
            }
            
            // Set default currency if not provided
            if (currency == null || currency.isEmpty()) {
                currency = "USD";
            }

            return paystackService.initializeTransaction(amount, currency, "Coin Purchase", metadata, email, reference, callbackUrl)
                    .map(response -> {
                        ApiResponse apiResponse = ApiResponse.createResponse(200, "Transaction initialized successfully", "SUCCESS", response);
                        return ResponseEntity.ok(apiResponse);
                    })
                    .onErrorResume(error -> {
                        ApiResponse apiResponse = ApiResponse.createResponse(400, "Failed to initialize transaction: " + error.getMessage(), "ERROR", null);
                        return Mono.just(ResponseEntity.badRequest().body(apiResponse));
                    });
        } catch (Exception e) {
            ApiResponse apiResponse = ApiResponse.createResponse(400, "Invalid request parameters: " + e.getMessage(), "ERROR", null);
            return Mono.just(ResponseEntity.badRequest().body(apiResponse));
        }
    }

    @GetMapping("/verify-transaction/{reference}")
    public Mono<ResponseEntity<ApiResponse>> verifyTransaction(@PathVariable String reference) {
        return paystackService.verifyTransaction(reference)
                .map(response -> {
                    ApiResponse apiResponse = ApiResponse.createResponse(200, "Transaction verified successfully", "SUCCESS", response);
                    return ResponseEntity.ok(apiResponse);
                })
                .onErrorResume(error -> {
                    ApiResponse apiResponse = ApiResponse.createResponse(400, "Failed to verify transaction: " + error.getMessage(), "ERROR", null);
                    return Mono.just(ResponseEntity.badRequest().body(apiResponse));
                });
    }
} 