package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TermsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
@RestController
@RequestMapping("/api/v1/terms")
public class TermsController {
    private final TermsService termsService;

    public TermsController(TermsService termsService) {
        this.termsService = termsService;
    }

    @GetMapping("/latest")
    public Mono<ApiResponse> getLatestTerms() {
        return termsService.getLatestTerms();
    }
}
