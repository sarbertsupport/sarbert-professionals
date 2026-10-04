package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    /** Public: published FAQs only, optional filter by category (case-insensitive). */
    @GetMapping
    public Mono<ResponseEntity<ApiResponse>> listFaqs(
            @RequestParam(required = false) String category
    ) {
        return faqService.listPublishedFaqs(category)
                .map(ResponseEntity::ok);
    }
}
