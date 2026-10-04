package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.SupportTicket;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface SupportTicketRepository extends ReactiveCrudRepository<SupportTicket, Long> {

    Mono<SupportTicket> findByTicketUuid(String ticketUuid);

    Flux<SupportTicket> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
