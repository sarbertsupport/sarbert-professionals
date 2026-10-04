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
@Table("admin_mfa_otp_send_log")
public class AdminMfaOtpSendLog {

    @Id
    private Long id;

    @Column("user_id")
    private Integer userId;

    @Column("sent_at")
    private LocalDateTime sentAt;
}
