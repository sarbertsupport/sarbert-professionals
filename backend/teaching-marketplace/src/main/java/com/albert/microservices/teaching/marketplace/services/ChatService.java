package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.ChatHistory;
import com.albert.microservices.teaching.marketplace.entities.ChatMessage;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

public interface ChatService {
    Mono<ChatMessage> sendMessage(ChatMessage message);
    Flux<ChatMessage> getMessagesByJob(Long jobId);
    Flux<ChatMessage> getMessagesForUser(Long jobId, Long userId);
    Mono<Void> markAsDelivered(Long messageId);
    Mono<Void> markAsRead(Long messageId);
    Mono<Void> markMessagesAsRead(List<Long> messageIds);
    Mono<Void> archiveMessage(Long messageId);
    Flux<ChatHistory> getChatHistory(Long jobId);
    Mono<ApiResponse> getMessagesForRecipient(
            Long recipientId,
            int page,
            int size,
            ChatMessage.MessageStatus status);
    Mono<ApiResponse> countApplicantsForJob(Integer jobId);

    Mono<ApiResponse> hasCurrentUserAppliedToJob(Integer jobId, Integer userId);
}
