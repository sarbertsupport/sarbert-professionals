package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.ChatMessage;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ChatMessageRepository extends ReactiveCrudRepository<ChatMessage, Long> {
    Flux<ChatMessage> findByJobId(Long jobId);
    Flux<ChatMessage> findByJobIdAndRecipientId(Long jobId, Long recipientId);
    Flux<ChatMessage> findByJobIdAndSenderId(Long jobId, Long senderId);
    
    @Query("""
        SELECT * FROM chat_messages 
        WHERE job_id = :jobId 
        AND (sender_id = :userId OR recipient_id = :userId)
        ORDER BY created_at DESC
        """)
    Flux<ChatMessage> findMessagesByJobAndUser(
            @Param("jobId") Long jobId,
            @Param("userId") Long userId);
    
    // OPTIMIZED: Add proper pagination query
    @Query("""
        SELECT * FROM chat_messages 
        WHERE sender_id = :userId OR recipient_id = :userId
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
        """)
    Flux<ChatMessage> findMessagesByUserPaginated(
            @Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("offset") long offset);
    
    // OPTIMIZED: Separate count query for total items
    @Query("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE sender_id = :userId OR recipient_id = :userId
        """)
    Mono<Long> countMessagesByUser(@Param("userId") Long userId);
    
    // OPTIMIZED: Separate count query for unread messages (only incoming: another user sent to you)
    @Query("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE recipient_id = :userId 
        AND sender_id IS NOT NULL
        AND sender_id <> recipient_id
        AND status = 'SENT'
        """)
    Mono<Long> countUnreadMessagesByUser(@Param("userId") Long userId);

    @Query("""
        SELECT * FROM chat_messages 
        WHERE recipient_id = :recipientId 
        AND (:jobId IS NULL OR job_id = :jobId)
        AND (:status IS NULL OR status = :status)
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
        """)
    Flux<ChatMessage> findMessagesForRecipientPaginated(
            @Param("recipientId") Long recipientId,
            @Param("jobId") Long jobId,
            @Param("status") String status,
            @Param("limit") int limit,
            @Param("offset") long offset);

    @Query("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE recipient_id = :recipientId 
        AND (:jobId IS NULL OR job_id = :jobId)
        AND (:status IS NULL OR status = :status)
        """)
    Mono<Long> countMessagesForRecipient(
            @Param("recipientId") Long recipientId,
            @Param("jobId") Long jobId,
            @Param("status") String status);

    @Query("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE recipient_id = :recipientId 
        AND (:status IS NULL OR status = :status)
        """)
    Mono<Long> countMessagesForUser(
            @Param("recipientId") Long recipientId,
            @Param("status") String status);

    /**
     * Inbox unread for notifications: only messages sent by someone else to this user, not yet read.
     */
    @Query("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE recipient_id = :recipientId 
        AND sender_id IS NOT NULL
        AND sender_id <> :recipientId
        AND (:jobId IS NULL OR job_id = :jobId)
        AND status IN ('SENT', 'DELIVERED')
        """)
    Mono<Long> countUnreadMessagesForRecipient(
            @Param("recipientId") Long recipientId,
            @Param("jobId") Long jobId);

    @Query("""
    SELECT COUNT(DISTINCT cm.sender_id) 
    FROM chat_messages cm
    JOIN job_postings jp ON cm.job_id = jp.job_id
    WHERE cm.job_id = :jobId
    AND cm.sender_id != CAST(jp.user_id AS BIGINT)
    """)
    Mono<Long> countDistinctSendersByJobId(@Param("jobId") Long jobId);
    
    @Query("""
        SELECT COUNT(*) > 0 
        FROM chat_messages 
        WHERE job_id = :jobId 
        AND sender_id = :userId
        """)
    Mono<Boolean> hasUserAppliedToJob(
            @Param("jobId") Long jobId,
            @Param("userId") Long userId);
}
