package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.BulkDiscount;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.BulkDiscountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/bulk-discounts")
public class BulkDiscountController {

    @Autowired
    private BulkDiscountService bulkDiscountService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/active")
    public Mono<ApiResponse> getAllActiveDiscounts() {
        return bulkDiscountService.getAllActiveDiscounts();
    }

    @PostMapping
    public Mono<ApiResponse> addBulkDiscount(@RequestBody @Valid BulkDiscount discount,
                                             ServerHttpRequest request) {
        String token = extractTokenFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        return bulkDiscountService.addBulkDiscount(discount, username);
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse> updateBulkDiscount(@PathVariable Long id,
                                                @RequestBody @Valid BulkDiscount discountUpdate,
                                                ServerHttpRequest request) {
        String token = extractTokenFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        return bulkDiscountService.updateBulkDiscount(id, discountUpdate, username);
    }

    @PatchMapping("/{id}/deactivate")
    public Mono<ApiResponse> deactivateDiscount(@PathVariable Long id,
                                                ServerHttpRequest request) {
        String token = extractTokenFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        return bulkDiscountService.deactivateDiscount(id, username);
    }
    @PatchMapping("/{id}/activate")
    public Mono<ApiResponse> activateDiscount(@PathVariable Long id,
                                                ServerHttpRequest request) {
        String token = extractTokenFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        return bulkDiscountService.activateDiscount(id, username);
    }

    private String extractTokenFromRequest(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }
}