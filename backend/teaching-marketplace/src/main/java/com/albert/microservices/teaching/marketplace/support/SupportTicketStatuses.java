package com.albert.microservices.teaching.marketplace.support;

import java.util.Set;

public final class SupportTicketStatuses {
    public static final String OPEN = "OPEN";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String WAITING_CUSTOMER = "WAITING_CUSTOMER";
    public static final String RESOLVED = "RESOLVED";
    public static final String CLOSED = "CLOSED";

    public static final Set<String> ALL = Set.of(
            OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED
    );

    public static boolean isTerminal(String status) {
        return RESOLVED.equalsIgnoreCase(status) || CLOSED.equalsIgnoreCase(status);
    }

    private SupportTicketStatuses() {}
}
