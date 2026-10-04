package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.requests.MfaOtpVerificationRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.AdminMfaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/admin/mfa")
@RequiredArgsConstructor
public class AdminMfaController {

    private final AdminMfaService adminMfaService;
    private final JwtUtil jwtUtil;

    @GetMapping("/status")
    public Mono<ResponseEntity<ApiResponse>> status(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            Authentication auth
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.fromCallable(() -> requireUserId(authorizationHeader))
                .flatMap(adminMfaService::mfaStatus)
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @PostMapping("/request-enable")
    public Mono<ResponseEntity<ApiResponse>> requestEnable(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            Authentication auth
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.fromCallable(() -> requireUserId(authorizationHeader))
                .flatMap(adminMfaService::requestEnableMfa)
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @PostMapping("/confirm-enable")
    public Mono<ResponseEntity<ApiResponse>> confirmEnable(
            Authentication auth,
            @Valid @RequestBody MfaOtpVerificationRequest request
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return adminMfaService.confirmEnableMfa(request.getSessionToken(), request.getOtp())
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @PostMapping("/request-disable")
    public Mono<ResponseEntity<ApiResponse>> requestDisable(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            Authentication auth
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.fromCallable(() -> requireUserId(authorizationHeader))
                .flatMap(adminMfaService::requestDisableMfa)
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @PostMapping("/confirm-disable")
    public Mono<ResponseEntity<ApiResponse>> confirmDisable(
            Authentication auth,
            @Valid @RequestBody MfaOtpVerificationRequest request
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return adminMfaService.confirmDisableMfa(request.getSessionToken(), request.getOtp())
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    private boolean hasAdminRole(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private Integer requireUserId(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid token");
        }
        return jwtUtil.extractUserId(authorizationHeader.substring(7));
    }

    private Mono<ResponseEntity<ApiResponse>> forbidden() {
        ApiResponse body = ApiResponse.createResponse(403, "Access denied", "Admin role required", null);
        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).body(body));
    }

    private Mono<ResponseEntity<ApiResponse>> mapStatus(ResponseStatusException ex) {
        int code = ex.getStatusCode().value();
        String reason = ex.getReason() != null ? ex.getReason() : "Request failed";
        ApiResponse body = ApiResponse.createResponse(code, reason, reason, null);
        return Mono.just(ResponseEntity.status(code).body(body));
    }
}
