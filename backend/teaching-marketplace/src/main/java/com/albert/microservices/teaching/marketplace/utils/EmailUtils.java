package com.albert.microservices.teaching.marketplace.utils;
public class EmailUtils {
    public static String getVerificationUrl(String host, String token) {
        return host + "?token=" + token;
    }
}
