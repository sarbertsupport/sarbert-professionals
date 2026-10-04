package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.AdminMfaOtpSendLog;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Repository
public interface AdminMfaOtpSendLogRepository extends ReactiveCrudRepository<AdminMfaOtpSendLog, Long> {

    @Query("SELECT COUNT(*) FROM admin_mfa_otp_send_log WHERE user_id = :userId AND sent_at > :since")
    Mono<Long> countRecentSends(Integer userId, LocalDateTime since);
}
