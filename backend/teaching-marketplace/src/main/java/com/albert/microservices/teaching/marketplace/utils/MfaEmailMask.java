package com.albert.microservices.teaching.marketplace.utils;

/** Masks email for safe display in MFA UI (never log OTP; masking is for UX only). */
public final class MfaEmailMask {
    private MfaEmailMask() {}

    public static String mask(String email) {
        if (email == null || email.isBlank()) {
            return "***";
        }
        int at = email.lastIndexOf('@');
        if (at < 1) {
            return "***";
        }
        String local = email.substring(0, at);
        String domain = email.substring(at + 1);
        int show = Math.min(3, local.length());
        String prefix = local.substring(0, show);
        int padLen = Math.max(8, local.length() - show);
        String stars = "*".repeat(Math.min(padLen, 12));
        return prefix + stars + "@" + domain;
    }
}
