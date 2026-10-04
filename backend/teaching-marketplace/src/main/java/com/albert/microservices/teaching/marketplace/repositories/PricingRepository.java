package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.Pricing;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface PricingRepository extends ReactiveCrudRepository<Pricing, Long> {
    @Query("SELECT id, base_price_per_coin, updated_at,created_at,created_by,updated_by FROM pricing ORDER BY updated_at DESC LIMIT 1")
    Mono<Pricing> findCurrentPricing();
}