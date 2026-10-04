package com.albert.microservices.teaching.marketplace.controllers;
import com.albert.microservices.teaching.marketplace.entities.ChatMessage;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

import static com.albert.microservices.teaching.marketplace.utils.Constants.UNAUTHORIZED;
import static com.albert.microservices.teaching.marketplace.utils.Constants.UNAUTHORIZED_VALUE;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public Mono<ChatMessage> sendMessage(@RequestBody @Valid ChatMessage message) {
        return chatService.sendMessage(message);
    }

    @GetMapping("/job/{jobId}")
    public Flux<ChatMessage> getJobMessages(@PathVariable Long jobId) {
        return chatService.getMessagesByJob(jobId);
    }

    @GetMapping("/job/{jobId}/user/{userId}")
    public Flux<ChatMessage> getUserMessagesForJob(
            @PathVariable Long jobId,
            @PathVariable Long userId) {
        return chatService.getMessagesForUser(jobId, userId);
    }

    @PatchMapping("/{messageId}/delivered")
    public Mono<Void> markDelivered(@PathVariable Long messageId) {
        return chatService.markAsDelivered(messageId);
    }

    @PatchMapping("/{messageId}/read")
    public Mono<Void> markRead(@PathVariable Long messageId) {
        return chatService.markAsRead(messageId);
    }

    @DeleteMapping("/{messageId}/archive")
    public Mono<Void> archiveMessage(@PathVariable Long messageId) {
        return chatService.archiveMessage(messageId);
    }

    @GetMapping(value = "/job/{jobId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatMessage> streamMessages(@PathVariable Long jobId) {
        return chatService.getMessagesByJob(jobId)
                .repeatWhen(flux -> flux.delayElements(Duration.ofSeconds(1)));
    }
    @GetMapping("/recipient/{recipientId}")
    public Mono<ApiResponse> getMessagesForRecipient(
            @PathVariable Long recipientId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ChatMessage.MessageStatus status) {
        int adjustedPage = page - 1;
        return chatService.getMessagesForRecipient(recipientId, adjustedPage, size, status);
    }
    @GetMapping("/{jobId}/applicants/count")
    public Mono<ResponseEntity<ApiResponse>> countJobApplicants(
            @PathVariable Integer jobId) {
        return chatService.countApplicantsForJob(jobId)
                .map(apiResponse -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(apiResponse))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Whether the authenticated user already has an application row for this job (no coin deduction needed to open chat).
     */
    @GetMapping("/{jobId}/applicants/me")
    public Mono<ResponseEntity<ApiResponse>> hasCurrentUserAppliedToJob(
            @PathVariable Integer jobId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ApiResponse.createResponse(
                            UNAUTHORIZED,
                            UNAUTHORIZED_VALUE,
                            UNAUTHORIZED_VALUE,
                            false)));
        }
        String token = authorizationHeader.substring(7);
        Integer userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ApiResponse.createResponse(
                            UNAUTHORIZED,
                            UNAUTHORIZED_VALUE,
                            UNAUTHORIZED_VALUE,
                            false)));
        }
        return chatService.hasCurrentUserAppliedToJob(jobId, userId)
                .map(apiResponse -> ResponseEntity.status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(apiResponse));
    }
}