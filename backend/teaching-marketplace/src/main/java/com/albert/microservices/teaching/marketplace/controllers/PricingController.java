package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.Pricing;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.PricingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/pricing")
public class PricingController {

    @Autowired
    private PricingService pricingService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/current")
    public Mono<ApiResponse> getCurrentPricing() {
        return pricingService.getCurrentPricing();
    }

    @PostMapping
    public Mono<ApiResponse> addPricing(@RequestBody @Valid Pricing pricing,
                                        ServerHttpRequest request) {
        String token = extractTokenFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        return pricingService.addPricing(pricing, username);
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse> updatePricing(@PathVariable Long id,
                                           @RequestBody @Valid Pricing pricingUpdate,
                                           ServerHttpRequest request) {
        String token = extractTokenFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        return pricingService.updatePricing(id, pricingUpdate, username);
    }

    private String extractTokenFromRequest(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }
}