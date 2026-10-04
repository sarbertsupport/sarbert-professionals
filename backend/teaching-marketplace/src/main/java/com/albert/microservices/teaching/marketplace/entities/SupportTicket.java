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
@Table("support_tickets")
public class SupportTicket {

    @Id
    private Long id;

    @Column("ticket_uuid")
    private String ticketUuid;

    @Column("user_id")
    private Integer userId;

    private String subject;

    private String category;

    private String priority;

    private String status;

    @Column("assigned_admin_user_id")
    private Integer assignedAdminUserId;

    @Column("sla_due_at")
    private LocalDateTime slaDueAt;

    @Column("resolution_sla_due_at")
    private LocalDateTime resolutionSlaDueAt;

    @Column("first_response_at")
    private LocalDateTime firstResponseAt;

    @Column("resolved_at")
    private LocalDateTime resolvedAt;

    @Column("closed_at")
    private LocalDateTime closedAt;

    @Column("unread_by_admin")
    private Boolean unreadByAdmin;

    @Column("unread_by_customer")
    private Boolean unreadByCustomer;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}
