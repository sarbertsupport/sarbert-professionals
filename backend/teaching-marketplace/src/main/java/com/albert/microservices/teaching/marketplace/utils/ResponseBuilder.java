package com.albert.microservices.teaching.marketplace.utils;


import org.springframework.stereotype.Component;


import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class ResponseBuilder {

    public static Map<String, Object> buildErrorResponse(
            int responseCode,
            String responseMessage,
            String customerMessage,
            Object data) {

        // Use LinkedHashMap to maintain insertion order
        Map<String, Object> response = new LinkedHashMap<>();
        Map<String, Object> headers = new LinkedHashMap<>();
        Map<String, Object> body = new LinkedHashMap<>();

        // Set headers in specific order
        headers.put("requestId", UUID.randomUUID().toString());
        headers.put("responseCode", responseCode);
        headers.put("timestamp", Instant.now().toEpochMilli());
        headers.put("customerMessage", customerMessage);
        headers.put("responseMessage", responseMessage);

        // Set body
        body.put("data", data);

        response.put("headers", headers);
        response.put("body", body);

        return response;
    }
}