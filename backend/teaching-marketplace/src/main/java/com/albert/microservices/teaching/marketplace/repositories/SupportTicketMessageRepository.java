package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.SupportTicketMessage;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface SupportTicketMessageRepository extends ReactiveCrudRepository<SupportTicketMessage, Long> {

    Flux<SupportTicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
