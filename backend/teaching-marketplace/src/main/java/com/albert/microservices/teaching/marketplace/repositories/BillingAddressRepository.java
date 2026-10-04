package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.BillingAddress;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface BillingAddressRepository extends R2dbcRepository<BillingAddress, Long> {
    Mono<BillingAddress> findByUserId(Integer userId);
}