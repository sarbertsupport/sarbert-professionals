package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.requests.ReconcileMpesaStkRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.MpesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/admin/mpesa")
@RequiredArgsConstructor
public class MpesaAdminController {

    private final MpesaService mpesaService;
    private final JwtUtil jwtUtil;

    private boolean hasAdminRole(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    /**
     * Reconcile an STK transaction via Safaricom STK Push Query API v2 (includes MpesaReceiptNumber when available).
     * Enforces a minimum age after creation to avoid querying before Safaricom has finished processing.
     */
    @PostMapping("/reconcile-stk")
    public Mono<ResponseEntity<ApiResponse>> reconcileStk(
            Authentication auth,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody ReconcileMpesaStkRequest request
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.defer(() -> {
                    validateBearer(authorizationHeader);
                    return mpesaService.reconcileStkViaQueryV2(request.getTransactionId())
                            .map(r -> ResponseEntity.status(r.getHeaders().getResponseCode()).body(r));
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    private void validateBearer(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid token");
        }
        jwtUtil.extractUserId(authorizationHeader.substring(7));
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
