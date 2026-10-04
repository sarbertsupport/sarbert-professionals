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
@Table("support_ticket_messages")
public class SupportTicketMessage {

    @Id
    private Long id;

    @Column("ticket_id")
    private Long ticketId;

    @Column("author_user_id")
    private Integer authorUserId;

    @Column("author_role")
    private String authorRole;

    private String body;

    @Column("internal_note")
    private Boolean internalNote;

    @Column("created_at")
    private LocalDateTime createdAt;
}
