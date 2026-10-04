package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.ContactService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/contacts")
public class ContactController {
    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }
    @GetMapping("/jobs/{jobId}")
    public Mono<ApiResponse> getJobContactNumber(
            @PathVariable Integer jobId,
            @RequestParam Integer applicantId) {

        return contactService.getPhoneNumber(jobId, applicantId);
    }
}
