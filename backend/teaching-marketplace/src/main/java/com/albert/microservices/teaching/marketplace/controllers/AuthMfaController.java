package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.requests.MfaOtpVerificationRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.AdminMfaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/auth/mfa")
@RequiredArgsConstructor
public class AuthMfaController {

    private final AdminMfaService adminMfaService;

    @PostMapping("/verify")
    public Mono<ResponseEntity<ApiResponse>> verifyLogin(@Valid @RequestBody MfaOtpVerificationRequest request) {
        return adminMfaService.verifyLoginMfa(request.getSessionToken(), request.getOtp())
                .onErrorResume(ResponseStatusException.class, ex -> {
                    int code = ex.getStatusCode().value();
                    String reason = ex.getReason() != null ? ex.getReason() : "Request failed";
                    return Mono.just(ResponseEntity.status(code)
                            .body(ApiResponse.createResponse(code, reason, reason, null)));
                });
    }
}
