package com.albert.microservices.teaching.marketplace.configs;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Ensures every request has an {@code X-Correlation-Id} on the request (for downstream use)
 * and echoes it on the response (for clients and tracing).
 */
@Component
@Order(-1)
public class CorrelationIdWebFilter implements WebFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String correlationId = exchange.getRequest().getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }
        final String id = correlationId;
        ServerWebExchange mutated = exchange.mutate()
                .request(exchange.getRequest().mutate().header(CORRELATION_ID_HEADER, id).build())
                .build();
        mutated.getResponse().getHeaders().add(CORRELATION_ID_HEADER, id);
        return chain.filter(mutated);
    }
}
