package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.CoinWallet;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface CoinWalletRepository extends ReactiveCrudRepository<CoinWallet, Integer> {
    Mono<CoinWallet> findByUserId(Integer userId);
}