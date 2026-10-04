package com.albert.microservices.teaching.marketplace.support;

public record SupportDeskSummaryRow(
        long totalTickets,
        long openTickets,
        long inProgressTickets,
        long waitingCustomerTickets,
        long resolvedTickets,
        long closedTickets,
        long unreadByAdminTickets,
        long firstResponseSlaBreached,
        long resolutionSlaBreached
) {}
