package com.albert.microservices.teaching.marketplace.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("chat_history")
public class ChatHistory {
    @Id
    private Long id;
    private Long originalMessageId;
    private Long jobId;
    private Long senderId;
    private Long recipientId;
    private String message;
    private String statusAtArchive;
    private LocalDateTime archivedAt;
}