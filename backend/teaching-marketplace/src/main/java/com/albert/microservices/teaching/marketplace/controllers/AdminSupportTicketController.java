package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.requests.AdminUpdateSupportTicketRequest;
import com.albert.microservices.teaching.marketplace.requests.SupportTicketReplyRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.SupportDeskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/admin/support")
@RequiredArgsConstructor
public class AdminSupportTicketController {

    private final SupportDeskService supportDeskService;
    private final JwtUtil jwtUtil;

    private boolean hasAdminRole(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @GetMapping("/summary")
    public Mono<ResponseEntity<ApiResponse>> summary(
            Authentication auth,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.defer(() -> {
                    requireUserId(authorizationHeader);
                    return supportDeskService.loadAdminSummary().map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @GetMapping("/tickets")
    public Mono<ResponseEntity<ApiResponse>> listTickets(
            Authentication auth,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean slaBreached,
            @RequestParam(required = false) Boolean resolutionSlaBreached,
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(required = false) String q
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.defer(() -> {
                    requireUserId(authorizationHeader);
                    return supportDeskService
                            .adminListTickets(page, pageSize, status, slaBreached, resolutionSlaBreached, unreadOnly, q)
                            .map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @GetMapping("/tickets/{ticketUuid}")
    public Mono<ResponseEntity<ApiResponse>> getTicket(
            Authentication auth,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String ticketUuid
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.defer(() -> {
                    requireUserId(authorizationHeader);
                    return supportDeskService.adminGetTicket(ticketUuid).map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @PutMapping("/tickets/{ticketUuid}")
    public Mono<ResponseEntity<ApiResponse>> updateTicket(
            Authentication auth,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String ticketUuid,
            @Valid @RequestBody AdminUpdateSupportTicketRequest request
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.defer(() -> {
                    Integer adminId = requireUserId(authorizationHeader);
                    return supportDeskService.adminUpdateTicket(ticketUuid, adminId, request).map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @PostMapping("/tickets/{ticketUuid}/replies")
    public Mono<ResponseEntity<ApiResponse>> reply(
            Authentication auth,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String ticketUuid,
            @Valid @RequestBody SupportTicketReplyRequest request
    ) {
        if (!hasAdminRole(auth)) {
            return forbidden();
        }
        return Mono.defer(() -> {
                    Integer adminId = requireUserId(authorizationHeader);
                    return supportDeskService.adminReply(ticketUuid, adminId, request).map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
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
