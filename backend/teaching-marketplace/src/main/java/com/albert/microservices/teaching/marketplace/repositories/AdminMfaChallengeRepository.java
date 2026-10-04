package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.AdminMfaChallenge;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Repository
public interface AdminMfaChallengeRepository extends ReactiveCrudRepository<AdminMfaChallenge, Long> {

    Mono<AdminMfaChallenge> findBySessionToken(String sessionToken);

    @Modifying
    @Query("DELETE FROM admin_mfa_challenges WHERE user_id = :userId AND challenge_type = :challengeType AND consumed_at IS NULL")
    Mono<Void> deleteActiveForUserAndType(Integer userId, String challengeType);

    @Modifying
    @Query("UPDATE admin_mfa_challenges SET consumed_at = :consumedAt WHERE id = :id")
    Mono<Void> markConsumed(Long id, LocalDateTime consumedAt);
}
