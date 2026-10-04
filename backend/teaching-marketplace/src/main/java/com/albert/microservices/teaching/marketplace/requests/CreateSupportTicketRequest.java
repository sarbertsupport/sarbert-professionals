package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSupportTicketRequest {

    @NotBlank(message = "Subject is required")
    @Size(min = 3, max = 500, message = "Subject must be between 3 and 500 characters")
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(min = 1, max = 20000, message = "Message length is invalid")
    private String message;

    /** GENERAL, BILLING, TECHNICAL, ACCOUNT, OTHER — empty uses server default */
    @Pattern(
            regexp = "^$|^(?i)(GENERAL|BILLING|TECHNICAL|ACCOUNT|OTHER)$",
            message = "category must be one of GENERAL, BILLING, TECHNICAL, ACCOUNT, OTHER"
    )
    @Size(max = 50)
    private String category = "GENERAL";

    /** LOW, NORMAL, HIGH, URGENT — empty uses server default */
    @Pattern(
            regexp = "^$|^(?i)(LOW|NORMAL|HIGH|URGENT)$",
            message = "priority must be one of LOW, NORMAL, HIGH, URGENT"
    )
    @Size(max = 20)
    private String priority = "NORMAL";
}
