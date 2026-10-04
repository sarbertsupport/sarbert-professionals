package com.albert.microservices.teaching.marketplace.utils;

/**
 * Redaction helpers so secrets and PII are not written to logs.
 */
public final class LogSanitizer {

    private LogSanitizer() {
    }

    /** For passwords, JWTs, reset tokens, etc.: no value, only length / presence. */
    public static String credentialMeta(String secret) {
        if (secret == null || secret.isBlank()) {
            return "absent";
        }
        return "present(len=" + secret.length() + ")";
    }

    /** Masks local part of email for operational logs. */
    public static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "absent";
        }
        int at = email.indexOf('@');
        if (at <= 0) {
            return "present(len=" + email.length() + ")";
        }
        return email.charAt(0) + "***@" + email.substring(at + 1);
    }
}
