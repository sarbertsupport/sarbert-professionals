package com.albert.microservices.teaching.marketplace.utils;

import java.util.Map;

/**
 * Lipa na M-Pesa / STK Push callback and query result codes (Daraja).
 * Descriptions are user-facing summaries; always persist the provider {@code ResultDesc} as well.
 */
public final class MpesaExpressResultCodes {

    private static final Map<Integer, String> KNOWN = Map.ofEntries(
            Map.entry(0, "Success — payment completed"),
            Map.entry(1, "Insufficient balance"),
            Map.entry(1001, "Internal error — try again later"),
            Map.entry(1002, "Internal error — retry after a short wait"),
            Map.entry(1011, "Invalid access token or session"),
            Map.entry(1012, "Amount below minimum or invalid amount"),
            Map.entry(1019, "Transaction expired"),
            Map.entry(1025, "Error processing request"),
            Map.entry(1028, "Unable to process the request"),
            Map.entry(1031, "Timeout waiting for customer input"),
            Map.entry(1032, "Request cancelled by user"),
            Map.entry(1037, "Timeout waiting for customer PIN"),
            Map.entry(1034, "Invalid shortcode"),
            Map.entry(1035, "Invalid account reference or description"),
            Map.entry(2001, "Wrong M-Pesa PIN"),
            Map.entry(2006, "Wrong PIN entered too many times")
    );

    private MpesaExpressResultCodes() {
    }

    public static String describe(int resultCode) {
        return KNOWN.getOrDefault(resultCode,
                "M-Pesa result code " + resultCode + " — see ResultDesc from Safaricom");
    }

    public static int parseInt(Object resultCode) {
        if (resultCode == null) {
            return -1;
        }
        if (resultCode instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.parseInt(resultCode.toString().trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
