package com.albert.microservices.teaching.marketplace.security.customfilters;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class CustomAuthenticationEntryPoint implements ServerAuthenticationEntryPoint {

    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException ex) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        String requestId = UUID.randomUUID().toString();

        // Get the current timestamp
        long timestamp = System.currentTimeMillis();
        String jsonString = "{"
                + "\"headers\": {"
                + "\"requestId\": \"" + requestId + "\","
                + "\"responseCode\": 401,"
                + "\"timestamp\": " + timestamp + ","
                + "\"customerMessage\": \"You must be authenticated to access this resource\","
                + "\"responseMessage\": \"Unauthorized\""
                + "},"
                + "\"body\": {"
                + "\"data\": null"
                + "}"
                + "}";
        byte[] bytes = jsonString
                .getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);

        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}