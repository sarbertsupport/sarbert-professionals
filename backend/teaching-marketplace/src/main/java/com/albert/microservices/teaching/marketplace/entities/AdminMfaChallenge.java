package com.albert.microservices.teaching.marketplace.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table("admin_mfa_challenges")
public class AdminMfaChallenge {

    @Id
    private Long id;

    @Column("user_id")
    private Integer userId;

    @Column("session_token")
    private String sessionToken;

    @Column("challenge_type")
    private String challengeType;

    @Column("otp_hash")
    private String otpHash;

    @Column("expires_at")
    private LocalDateTime expiresAt;

    @Column("consumed_at")
    private LocalDateTime consumedAt;

    @Column("created_at")
    private LocalDateTime createdAt;
}
