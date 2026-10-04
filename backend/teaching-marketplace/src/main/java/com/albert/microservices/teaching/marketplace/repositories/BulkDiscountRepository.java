package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.BulkDiscount;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface BulkDiscountRepository extends ReactiveCrudRepository<BulkDiscount, Long> {
    @Query("SELECT id, min_coins, discount_percentage, active,created_by,updated_by,created_at,updated_at FROM bulk_discounts ORDER BY min_coins ASC")
    Flux<BulkDiscount> findAllActiveDiscounts();
}