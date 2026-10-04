package com.albert.microservices.teaching.marketplace.support;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.regex.Pattern;

public final class SupportTicketUuidConstraints {

    /** New format: 2–8 letter/digit prefix + 6–15 digits (e.g. INCC000000001). */
    private static final Pattern PUBLIC_TICKET_REF = Pattern.compile("^[A-Z0-9]{2,8}[0-9]{6,15}$");

    private static final Pattern LEGACY_UUID = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    private SupportTicketUuidConstraints() {}

    /**
     * Accepts legacy UUID tickets or {@code PREFIX + digits} (e.g. INCC000000001).
     */
    public static void requireValidTicketUuid(String raw) {
        if (raw == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket id is required");
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty() || trimmed.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket id");
        }
        if (LEGACY_UUID.matcher(trimmed).matches()) {
            return;
        }
        String upper = trimmed.toUpperCase(Locale.ROOT);
        if (PUBLIC_TICKET_REF.matcher(upper).matches()) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket id format");
    }

    /**
     * Normalizes case for PREFIX+digit references; leaves legacy UUIDs unchanged.
     */
    public static String normalizeTicketUuid(String raw) {
        requireValidTicketUuid(raw);
        String trimmed = raw.trim();
        if (LEGACY_UUID.matcher(trimmed).matches()) {
            return trimmed;
        }
        return trimmed.toUpperCase(Locale.ROOT);
    }
}
