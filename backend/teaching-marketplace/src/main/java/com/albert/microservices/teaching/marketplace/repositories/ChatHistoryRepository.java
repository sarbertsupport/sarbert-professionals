package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.ChatHistory;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
@Repository
public interface ChatHistoryRepository extends ReactiveCrudRepository<ChatHistory, Long> {
    Flux<ChatHistory> findByJobId(Long jobId);
    Flux<ChatHistory> findByOriginalMessageId(Long originalMessageId);
}