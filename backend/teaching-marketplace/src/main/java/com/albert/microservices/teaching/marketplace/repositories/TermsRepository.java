package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.Terms;
import com.albert.microservices.teaching.marketplace.requests.TermsDto;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface TermsRepository extends ReactiveCrudRepository<Terms, Integer> {
    @Query("SELECT title,content,updated_at FROM terms_and_conditions ORDER BY created_at DESC LIMIT 1")
    Mono<TermsDto> findLatestTerms();
}
