package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.Faq;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface FaqRepository extends R2dbcRepository<Faq, Long> {

    Flux<Faq> findByActiveIsTrueOrderBySortOrderAsc();

    Flux<Faq> findByActiveIsTrueAndCategoryIgnoreCaseOrderBySortOrderAsc(String category);
}
