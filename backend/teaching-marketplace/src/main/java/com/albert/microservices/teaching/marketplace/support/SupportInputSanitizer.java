package com.albert.microservices.teaching.marketplace.support;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Normalizes and strips dangerous / noisy content from user-provided support text (plain-text model).
 */
public final class SupportInputSanitizer {

    public static final int MAX_SUBJECT_LENGTH = 500;
    public static final int MAX_MESSAGE_LENGTH = 20000;
    public static final int MAX_ADMIN_SEARCH_LENGTH = 200;
    private static final int MAX_NEWLINE_RUN = 24;
    private static final Pattern EXCESSIVE_NEWLINES = Pattern.compile("\n{" + (MAX_NEWLINE_RUN + 1) + ",}");

    private SupportInputSanitizer() {}

    /**
     * Single-line style: trims, strips controls/HTML delimiters, collapses inner whitespace.
     */
    public static String sanitizeSubject(String raw) {
        return sanitizeSubject(raw, MAX_SUBJECT_LENGTH);
    }

    public static String sanitizeSubject(String raw, int maxLen) {
        String s = normalizeCore(raw, maxLen);
        if (s.isEmpty()) {
            return "";
        }
        String collapsed = s.replaceAll("\\s+", " ").trim();
        return collapsed.length() > maxLen ? collapsed.substring(0, maxLen) : collapsed;
    }

    /**
     * Multi-line message: preserves newlines; strips dangerous characters and caps newline runs.
     */
    public static String sanitizeMessageBody(String raw) {
        return sanitizeMessageBody(raw, MAX_MESSAGE_LENGTH);
    }

    public static String sanitizeMessageBody(String raw, int maxLen) {
        String s = normalizeCore(raw, maxLen);
        if (s.isEmpty()) {
            return "";
        }
        s = s.replace("\r\n", "\n").replace('\r', '\n');
        s = EXCESSIVE_NEWLINES.matcher(s).replaceAll("\n".repeat(MAX_NEWLINE_RUN));
        return s.length() > maxLen ? s.substring(0, maxLen) : s;
    }

    /** Admin list search: short, single-line. */
    public static String sanitizeSearchQuery(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return sanitizeSubject(raw, MAX_ADMIN_SEARCH_LENGTH);
    }

    private static String normalizeCore(String raw, int maxLen) {
        if (raw == null) {
            return "";
        }
        String n = Normalizer.normalize(raw.strip(), Normalizer.Form.NFKC);
        if (n.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder(Math.min(n.length(), maxLen + 16));
        for (int i = 0; i < n.length(); i++) {
            char c = n.charAt(i);
            if (c == 0) {
                continue;
            }
            if (Character.isISOControl(c) && c != '\n' && c != '\r' && c != '\t') {
                continue;
            }
            if (c == '<' || c == '>') {
                continue;
            }
            sb.append(c);
            if (sb.length() >= maxLen + 64) {
                break;
            }
        }
        return sb.toString().strip();
    }
}
