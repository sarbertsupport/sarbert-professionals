package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SupportTicketReplyRequest {

    @NotBlank(message = "Message is required")
    @Size(min = 1, max = 20000, message = "Message length is invalid")
    private String message;

    /** Admin only; ignored for customers */
    private boolean internalNote;
}
