package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.requests.CreateSupportTicketRequest;
import com.albert.microservices.teaching.marketplace.requests.SupportTicketReplyRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.SupportDeskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportDeskService supportDeskService;
    private final JwtUtil jwtUtil;

    @PostMapping("/tickets")
    public Mono<ResponseEntity<ApiResponse>> createTicket(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody CreateSupportTicketRequest request
    ) {
        return Mono.defer(() -> {
                    Integer userId = requireUserId(authorizationHeader);
                    return supportDeskService.createTicket(userId, request)
                            .map(body -> ResponseEntity.status(HttpStatus.CREATED).body(body));
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @GetMapping("/tickets")
    public Mono<ResponseEntity<ApiResponse>> myTickets(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return Mono.defer(() -> {
                    Integer userId = requireUserId(authorizationHeader);
                    return supportDeskService.listMyTickets(userId).map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @GetMapping("/tickets/{ticketUuid}")
    public Mono<ResponseEntity<ApiResponse>> getTicket(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String ticketUuid
    ) {
        return Mono.defer(() -> {
                    Integer userId = requireUserId(authorizationHeader);
                    return supportDeskService.getTicketForCustomer(ticketUuid, userId).map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    @PostMapping("/tickets/{ticketUuid}/replies")
    public Mono<ResponseEntity<ApiResponse>> reply(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String ticketUuid,
            @Valid @RequestBody SupportTicketReplyRequest request
    ) {
        return Mono.defer(() -> {
                    Integer userId = requireUserId(authorizationHeader);
                    request.setInternalNote(false);
                    return supportDeskService.customerReply(ticketUuid, userId, request).map(ResponseEntity::ok);
                })
                .onErrorResume(ResponseStatusException.class, this::mapStatus);
    }

    private Integer requireUserId(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid token");
        }
        return jwtUtil.extractUserId(authorizationHeader.substring(7));
    }

    private Mono<ResponseEntity<ApiResponse>> mapStatus(ResponseStatusException ex) {
        int code = ex.getStatusCode().value();
        String reason = ex.getReason() != null ? ex.getReason() : "Request failed";
        ApiResponse body = ApiResponse.createResponse(code, reason, reason, null);
        return Mono.just(ResponseEntity.status(code).body(body));
    }
}
