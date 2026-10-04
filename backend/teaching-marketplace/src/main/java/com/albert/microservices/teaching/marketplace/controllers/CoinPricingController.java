package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.CoinPricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
public class CoinPricingController {
    private final CoinPricingService pricingService;

    @GetMapping("/calculate")
    public Mono<ResponseEntity<ApiResponse>> calculatePrice(
            @RequestParam Integer coins) {
        return pricingService.calculateCoinPrice(coins)
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode())
                        .body(apiResponse));
    }
}