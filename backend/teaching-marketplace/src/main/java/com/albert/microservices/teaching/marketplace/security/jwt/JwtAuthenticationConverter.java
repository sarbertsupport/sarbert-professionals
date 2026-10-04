package com.albert.microservices.teaching.marketplace.security.jwt;

import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationConverter implements ServerAuthenticationConverter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private final JwtUtil jwtUtil;
    private final ReactiveUserDetailsService userDetailsService;

    public JwtAuthenticationConverter(JwtUtil jwtUtil, ReactiveUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        String requestId = UUID.randomUUID().toString();
        long timestamp = System.currentTimeMillis();

        String jsonString = "{"
                + "\"headers\": {"
                + "\"requestId\": \"" + requestId + "\","
                + "\"responseCode\": 401,"
                + "\"timestamp\": " + timestamp + ","
                + "\"customerMessage\": \"Invalid or expired access token\","
                + "\"responseMessage\": \"Invalid or expired access token\""
                + "},"
                + "\"body\": {"
                + "\"data\": null"
                + "}"
                + "}";

        return extractTokenFromRequest(exchange)
                .flatMap(token -> {
                    if (token.chars().filter(ch -> ch == '.').count() != 2) {
                        return Mono.error(new BadCredentialsException("Malformed JWT token"));
                    }
                    try {
                        Claims claims = jwtUtil.parseToken(token);
                        String username = claims.getSubject();
                        List<GrantedAuthority> authorities = new ArrayList<>();

                        // Extract roles only (permissions removed)
                        String roles = claims.get("roles", String.class);
                        if (roles != null) {
                            authorities.addAll(
                                    Arrays.stream(roles.split(","))
                                            .map(SimpleGrantedAuthority::new)
                                            .collect(Collectors.toList())
                            );
                        }

                        return userDetailsService.findByUsername(username)
                                .map(userDetails -> (Authentication) new UsernamePasswordAuthenticationToken(userDetails, token, authorities))
                                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found")));
                    } catch (Exception e) {
                        return Mono.error(new BadCredentialsException("Invalid JWT token"));
                    }
                })
                .onErrorResume(e -> {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                    byte[] errorResponse = jsonString.getBytes();
                    return exchange.getResponse()
                            .writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(errorResponse)))
                            .then(Mono.empty());
                });
    }

    private Mono<String> extractTokenFromRequest(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(AUTHORIZATION_HEADER);
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            return Mono.just(authHeader.substring(BEARER_PREFIX.length()));
        }
        // Browser WebSocket API cannot set Authorization; handshake uses ?token=
        return Mono.justOrEmpty(exchange.getRequest().getQueryParams().getFirst("token"))
                .map(String::trim)
                .filter(t -> !t.isEmpty());
    }
}
