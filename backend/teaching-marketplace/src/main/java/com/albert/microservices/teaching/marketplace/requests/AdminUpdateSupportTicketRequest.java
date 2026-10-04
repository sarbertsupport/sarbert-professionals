package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateSupportTicketRequest {

    /** Empty keeps current status */
    @Size(max = 30)
    @Pattern(
            regexp = "^$|^(?i)(OPEN|IN_PROGRESS|WAITING_CUSTOMER|RESOLVED|CLOSED)$",
            message = "status must be OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, or CLOSED"
    )
    private String status;

    @Size(max = 20)
    @Pattern(
            regexp = "^$|^(?i)(LOW|NORMAL|HIGH|URGENT)$",
            message = "priority must be one of LOW, NORMAL, HIGH, URGENT"
    )
    private String priority;

    @Size(max = 50)
    @Pattern(
            regexp = "^$|^(?i)(GENERAL|BILLING|TECHNICAL|ACCOUNT|OTHER)$",
            message = "category must be one of GENERAL, BILLING, TECHNICAL, ACCOUNT, OTHER"
    )
    private String category;

    @Positive(message = "assignedAdminUserId must be positive when set")
    private Integer assignedAdminUserId;
}
