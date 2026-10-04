package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.ChatHistory;
import com.albert.microservices.teaching.marketplace.entities.ChatMessage;
import com.albert.microservices.teaching.marketplace.repositories.ChatHistoryRepository;
import com.albert.microservices.teaching.marketplace.repositories.ChatMessageRepository;
import com.albert.microservices.teaching.marketplace.repositories.JobApplicantRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.ChatService;
import com.albert.microservices.teaching.marketplace.utils.ChatJobBroadcastHub;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private static final Logger logger = LoggerFactory.getLogger(ChatServiceImpl.class);
    private final ChatMessageRepository messageRepository;
    private final ChatHistoryRepository historyRepository;
    private final JobApplicantRepository jobApplicantRepository;
    private final ChatJobBroadcastHub chatJobBroadcastHub;

    @Override
    @Transactional
    public Mono<ChatMessage> sendMessage(ChatMessage message) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = message != null
                ? String.format("jobId=%s senderId=%s recipientId=%s contentLen=%s",
                message.getJobId(), message.getSenderId(), message.getRecipientId(),
                message.getMessage() != null ? message.getMessage().length() : 0)
                : "null";

        LoggingUtility.logInfo(logger, transactionId, "sendMessage",
                null, 200, null, requestPayload, null);

        if (message == null || message.getMessage() == null || message.getMessage().trim().isEmpty()) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "sendMessage",
                    duration, CODE_VALIDATION, "Message cannot be empty",
                    "Bad Request", requestPayload, null);
            return Mono.error(new IllegalArgumentException("Message cannot be empty"));
        }

        message.setStatus(ChatMessage.MessageStatus.SENT);
        message.setCreatedAt(LocalDateTime.now());

        return messageRepository.save(message)
                .doOnSuccess(savedMessage -> {
                    if (savedMessage.getJobId() != null) {
                        chatJobBroadcastHub.publish(savedMessage.getJobId(), savedMessage);
                    }
                })
                .flatMap(savedMessage -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "sendMessage",
                            duration, CODE_SUCCESS, "Message sent successfully",
                            null,"");
                    return Mono.just(savedMessage);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "sendMessage",
                            duration, CODE_SERVER_ERROR, "Error sending message",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    public Flux<ChatMessage> getMessagesByJob(Long jobId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "jobId=" + jobId;

        LoggingUtility.logInfo(logger, transactionId, "getMessagesByJob",
                null, 200, null, requestPayload, null);

        if (jobId == null || jobId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "getMessagesByJob",
                    duration, CODE_VALIDATION, "Invalid job ID",
                    "Bad Request", requestPayload, null);
            return Flux.error(new IllegalArgumentException("Invalid job ID"));
        }

        return messageRepository.findByJobId(jobId)
                .sort(Comparator.comparing(ChatMessage::getCreatedAt))
                .doOnComplete(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getMessagesByJob",
                            duration, CODE_SUCCESS, "Messages retrieved successfully",
                            null, null);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getMessagesByJob",
                            duration, CODE_SERVER_ERROR, "Error retrieving messages",
                            e.getMessage(), requestPayload, null);
                    return Flux.error(e);
                });
    }

    @Override
    public Flux<ChatMessage> getMessagesForUser(Long jobId, Long userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("jobId=%d, userId=%d", jobId, userId);

        LoggingUtility.logInfo(logger, transactionId, "getMessagesForUser",
                null, 200, null, requestPayload, null);

        if (jobId == null || jobId <= 0 || userId == null || userId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "getMessagesForUser",
                    duration, CODE_VALIDATION, "Invalid job ID or user ID",
                    "Bad Request", requestPayload, null);
            return Flux.error(new IllegalArgumentException("Invalid job ID or user ID"));
        }

        return messageRepository.findMessagesByJobAndUser(jobId, userId)
                .sort(Comparator.comparing(ChatMessage::getCreatedAt))
                .doOnComplete(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getMessagesForUser",
                            duration, CODE_SUCCESS, "Messages retrieved successfully",
                            null, null);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getMessagesForUser",
                            duration, CODE_SERVER_ERROR, "Error retrieving messages",
                            e.getMessage(), requestPayload, null);
                    return Flux.error(e);
                });
    }

    @Override
    @Transactional
    public Mono<Void> markAsDelivered(Long messageId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "messageId=" + messageId;

        LoggingUtility.logInfo(logger, transactionId, "markAsDelivered",
                null, 200, null, requestPayload, null);

        if (messageId == null || messageId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "markAsDelivered",
                    duration, CODE_VALIDATION, "Invalid message ID",
                    "Bad Request", requestPayload, null);
            return Mono.error(new IllegalArgumentException("Invalid message ID"));
        }

        return messageRepository.findById(messageId)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "markAsDelivered",
                            duration, CODE_NOT_FOUND, "Message not found",
                            "Not Found", requestPayload, null);
                    return Mono.error(new RuntimeException("Message not found"));
                }))
                .flatMap(msg -> {
                    if (msg.getStatus() != ChatMessage.MessageStatus.READ) {
                        msg.setStatus(ChatMessage.MessageStatus.DELIVERED);
                        return messageRepository.save(msg)
                                .doOnSuccess(savedMsg -> {
                                    long duration = System.currentTimeMillis() - startTime;
                                    LoggingUtility.logInfo(logger, transactionId, "markAsDelivered",
                                            duration, CODE_SUCCESS, "Message marked as delivered",
                                            null, "");
                                });
                    }
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "markAsDelivered",
                            duration, CODE_SUCCESS, "Message already read, no status change",
                            null, "");
                    return Mono.just(msg);
                })
                .then()
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "markAsDelivered",
                            duration, CODE_SERVER_ERROR, "Error marking message as delivered",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    @Transactional
    public Mono<Void> markAsRead(Long messageId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "messageId=" + messageId;

        LoggingUtility.logInfo(logger, transactionId, "markAsRead",
                null, 200, null, requestPayload, null);

        if (messageId == null || messageId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "markAsRead",
                    duration, CODE_VALIDATION, "Invalid message ID",
                    "Bad Request", requestPayload, null);
            return Mono.error(new IllegalArgumentException("Invalid message ID"));
        }

        return messageRepository.findById(messageId)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "markAsRead",
                            duration, CODE_NOT_FOUND, "Message not found",
                            "Not Found", requestPayload, null);
                    return Mono.error(new RuntimeException("Message not found"));
                }))
                .flatMap(msg -> {
                    msg.setStatus(ChatMessage.MessageStatus.READ);
                    return messageRepository.save(msg)
                            .doOnSuccess(savedMsg -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "markAsRead",
                                        duration, CODE_SUCCESS, "Message marked as read",
                                        null, "");
                            });
                })
                .then()
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "markAsRead",
                            duration, CODE_SERVER_ERROR, "Error marking message as read",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    @Transactional
    public Mono<Void> archiveMessage(Long messageId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "messageId=" + messageId;

        LoggingUtility.logInfo(logger, transactionId, "archiveMessage",
                null, 200, null, requestPayload, null);

        if (messageId == null || messageId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "archiveMessage",
                    duration, CODE_VALIDATION, "Invalid message ID",
                    "Bad Request", requestPayload, null);
            return Mono.error(new IllegalArgumentException("Invalid message ID"));
        }

        return messageRepository.findById(messageId)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "archiveMessage",
                            duration, CODE_NOT_FOUND, "Message not found",
                            "Not Found", requestPayload, null);
                    return Mono.error(new RuntimeException("Message not found"));
                }))
                .flatMap(msg -> {
                    ChatHistory history = ChatHistory.builder()
                            .originalMessageId(msg.getId())
                            .jobId(msg.getJobId())
                            .senderId(msg.getSenderId())
                            .recipientId(msg.getRecipientId())
                            .message(msg.getMessage())
                            .statusAtArchive(msg.getStatus().name())
                            .archivedAt(LocalDateTime.now())
                            .build();

                    return historyRepository.save(history)
                            .doOnSuccess(savedHistory -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "archiveMessage",
                                        duration, CODE_SUCCESS, "Message archived successfully",
                                        null, "");
                            })
                            .then(messageRepository.delete(msg))
                            .doOnSuccess(v -> {
                                LoggingUtility.logInfo(logger, transactionId, "archiveMessage",
                                        System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                        "Original message deleted after archiving", null, null);
                            });
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "archiveMessage",
                            duration, CODE_SERVER_ERROR, "Error archiving message",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    @Transactional
    public Mono<Void> markMessagesAsRead(List<Long> messageIds) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = messageIds != null ? messageIds.toString() : "null";

        LoggingUtility.logInfo(logger, transactionId, "markMessagesAsRead",
                null, 200, null, requestPayload, null);

        if (messageIds == null || messageIds.isEmpty()) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "markMessagesAsRead",
                    duration, CODE_VALIDATION, "Message IDs cannot be empty",
                    "Bad Request", requestPayload, null);
            return Mono.error(new IllegalArgumentException("Message IDs cannot be empty"));
        }

        return Flux.fromIterable(messageIds)
                .flatMap(this::markAsRead)
                .then()
                .doOnSuccess(v -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "markMessagesAsRead",
                            duration, CODE_SUCCESS, "All messages marked as read",
                            null, null);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "markMessagesAsRead",
                            duration, CODE_SERVER_ERROR, "Error marking messages as read",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Override
    public Flux<ChatHistory> getChatHistory(Long jobId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "jobId=" + jobId;

        LoggingUtility.logInfo(logger, transactionId, "getChatHistory",
                null, 200, null, requestPayload, null);

        if (jobId == null || jobId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "getChatHistory",
                    duration, CODE_VALIDATION, "Invalid job ID",
                    "Bad Request", requestPayload, null);
            return Flux.error(new IllegalArgumentException("Invalid job ID"));
        }

        return historyRepository.findByJobId(jobId)
                .sort(Comparator.comparing(ChatHistory::getArchivedAt))
                .doOnComplete(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getChatHistory",
                            duration, CODE_SUCCESS, "Chat history retrieved successfully",
                            null, null);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getChatHistory",
                            duration, CODE_SERVER_ERROR, "Error retrieving chat history",
                            e.getMessage(), requestPayload, null);
                    return Flux.error(e);
                });
    }

    @Override
    public Mono<ApiResponse> getMessagesForRecipient(
            Long recipientId,
            int page,
            int size,
            ChatMessage.MessageStatus status) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("recipientId=%d, page=%d, size=%d, status=%s",
                recipientId, page, size, status != null ? status.name() : "null");

        LoggingUtility.logInfo(logger, transactionId, "getMessagesForRecipient",
                null, 200, null, requestPayload, null);

        final int effectivePage = page < 0 ? 0 : page;
        final int effectiveSize = size <= 0 ? 10 : size;

        if (recipientId == null || recipientId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "getMessagesForRecipient",
                    duration, CODE_VALIDATION, "Invalid recipient ID",
                    "Bad Request", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Invalid recipient ID",
                    BAD_REQUEST,
                    null));
        }

        long offset = (long) effectivePage * effectiveSize;

        // OPTIMIZED: Use database-level pagination instead of memory pagination
        Flux<ChatMessage> messagesFlux = messageRepository.findMessagesByUserPaginated(
                recipientId, effectiveSize, offset);

        // OPTIMIZED: Use separate count query
        Mono<Long> totalCountMono = messageRepository.countMessagesByUser(recipientId);

        // OPTIMIZED: Use separate unread count query
        Mono<Long> unreadCountMono = messageRepository.countUnreadMessagesByUser(recipientId);

        return Mono.zip(
                messagesFlux.collectList(),
                totalCountMono,
                unreadCountMono)
                .flatMap(tuple -> {
                    List<ChatMessage> messages = tuple.getT1();
                    long totalItems = tuple.getT2();
                    long unreadCount = tuple.getT3();
                    int totalPages = (int) Math.ceil((double) totalItems / effectiveSize);

                    if (messages.isEmpty()) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "getMessagesForRecipient",
                                duration, CODE_NOT_FOUND, "No messages found",
                                "Not Found", requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "No messages found",
                                NOTFOUND,
                                null));
                    }

                    Map<String, Object> result = new HashMap<>();
                    result.put("messages", messages);
                    result.put("currentPage", effectivePage + 1);
                    result.put("totalItems", totalItems);
                    result.put("totalPages", totalPages);
                    result.put("unreadCount", unreadCount);

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getMessagesForRecipient",
                            duration, CODE_SUCCESS, "Messages fetched successfully",
                            null, "");
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Messages fetched successfully",
                            OPERATION_SUCCESS,
                            result));
                })
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getMessagesForRecipient",
                            duration, CODE_SERVER_ERROR, "Error fetching messages",
                            ex.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error fetching messages",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }

    @Override
    public Mono<ApiResponse> countApplicantsForJob(Integer jobId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "jobId=" + jobId;

        LoggingUtility.logInfo(logger, transactionId, "countApplicantsForJob",
                null, 200, null, requestPayload, null);

        if (jobId == null || jobId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "countApplicantsForJob",
                    duration, CODE_VALIDATION, "Invalid job ID",
                    "Bad Request", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Invalid job ID",
                    BAD_REQUEST,
                    null));
        }

        return jobApplicantRepository.countDistinctSendersByJobId(jobId.longValue())
                .map(applicantCount -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "countApplicantsForJob",
                            duration, CODE_SUCCESS, "Applicant count fetched successfully",
                            null, "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Applicant count fetched successfully",
                            OPERATION_SUCCESS,
                            applicantCount);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "countApplicantsForJob",
                            duration, CODE_SUCCESS, "No applicants found for this job",
                            null, "0");
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "No applicants found for this job",
                            OPERATION_SUCCESS,
                            0L));
                }))
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "countApplicantsForJob",
                            duration, CODE_SERVER_ERROR, "Error counting applicants",
                            ex.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error counting applicants. Please try again.",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }

    @Override
    public Mono<ApiResponse> hasCurrentUserAppliedToJob(Integer jobId, Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "jobId=" + jobId + ", userId=" + userId;

        if (jobId == null || jobId <= 0 || userId == null || userId <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "hasCurrentUserAppliedToJob",
                    duration, CODE_VALIDATION, "Invalid job ID or user ID",
                    "Bad Request", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Invalid job or user",
                    BAD_REQUEST,
                    false));
        }

        return jobApplicantRepository.existsByJobIdAndApplicantId(jobId.longValue(), userId.longValue())
                .map(applied -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "hasCurrentUserAppliedToJob",
                            duration, CODE_SUCCESS, "Applicant check completed",
                            null, "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Applicant check completed",
                            OPERATION_SUCCESS,
                            Boolean.TRUE.equals(applied));
                })
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "hasCurrentUserAppliedToJob",
                            duration, CODE_SERVER_ERROR, "Error checking applicant status",
                            ex.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Could not verify application status. Please try again.",
                            SERVER_ERROR,
                            false));
                });
    }
}