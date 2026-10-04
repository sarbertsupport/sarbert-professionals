package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("chat_messages")
public class ChatMessage {
    @Id
    private Long id;

    @NotNull(message = "Job ID cannot be null")
    @Positive(message = "Job ID must be a positive number")
    private Long jobId;

    @NotNull(message = "Sender ID cannot be null")
    @Positive(message = "Sender ID must be a positive number")
    private Long senderId;

    @NotNull(message = "Recipient ID cannot be null")
    @Positive(message = "Recipient ID must be a positive number")
    private Long recipientId;

    @NotBlank(message = "Message content cannot be blank")
    @Size(min = 1, max = 2000, message = "Message must be between 1 and 2000 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\p{P}\\p{Z}\\p{Sm}\\p{Sc}]*$",
            message = "Message contains invalid characters")
    private String message;

    private String chatResponse;

    private MessageStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime answeredAt;

    public enum MessageStatus {
        SENT, DELIVERED, READ
    }
}