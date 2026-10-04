package com.albert.microservices.teaching.marketplace.configs;

import com.albert.microservices.teaching.marketplace.security.customfilters.CustomAuthenticationEntryPoint;
import com.albert.microservices.teaching.marketplace.security.customfilters.CustomReactiveAuthenticationManager;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtAuthenticationConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final CustomReactiveAuthenticationManager authenticationManager;
    private final JwtAuthenticationConverter jwtAuthenticationConverter;

    @Value("${spring.frontend.url:*}") // fallback to * if not set
    private String frontendUrls;

    public SecurityConfig(@Lazy CustomReactiveAuthenticationManager authenticationManager,
                          JwtAuthenticationConverter jwtAuthenticationConverter) {
        this.authenticationManager = authenticationManager;
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Security headers for all responses
     */
    @Bean
    public WebFilter securityHeadersFilter() {
        return (exchange, chain) -> {
            exchange.getResponse().getHeaders().add("X-Content-Type-Options", "nosniff");
            exchange.getResponse().getHeaders().add("X-XSS-Protection", "1; mode=block");
            exchange.getResponse().getHeaders().add("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
            exchange.getResponse().getHeaders().add("Referrer-Policy", "strict-origin-when-cross-origin");
            exchange.getResponse().getHeaders().add("Content-Security-Policy",
                    "default-src 'self'; " +
                            "script-src 'self' 'unsafe-inline'; " +
                            "style-src 'self' 'unsafe-inline'; " +
                            "img-src 'self' data: https:; " +
                            "font-src 'self' data:; " +
                            "connect-src 'self' http://localhost:8089 ws://localhost:8089 https://skillbridge-website.onrender.com wss://skillbridge-website.onrender.com https://api.paystack.co; " +
                            "frame-ancestors 'none';"); // modern replacement for X-Frame-Options
            exchange.getResponse().getHeaders().add("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
            return chain.filter(exchange);
        };
    }

    /**
     * Main security filter chain
     */
    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
        // JWT authentication filter
        AuthenticationWebFilter authenticationWebFilter = new AuthenticationWebFilter(authenticationManager);
        authenticationWebFilter.setServerAuthenticationConverter(jwtAuthenticationConverter);

        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Disable CSRF for stateless JWT
                .headers(headers -> headers
                        .contentTypeOptions() // Adds X-Content-Type-Options
                )
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .pathMatchers(getPermitAllPaths()).permitAll()
                        .anyExchange().authenticated()
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authenticationManager(authenticationManager)
                .addFilterAt(authenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                );

        return http.build();
    }

    private String[] getPermitAllPaths() {
        return new String[]{
                // Authentication endpoints
                "/api/v1/users/register",
                "/api/v1/users/verify/**",
                "/api/v1/auth/login",
                "/api/v1/auth/mfa/verify",
                "/api/v1/users/request-password-reset",
                "/api/v1/users/reset-password",

                // Public read-only endpoints
                "/api/v1/jobs",
                "/api/v1/subjects/all",
                "/api/v1/teachers/subjects",
                "/api/v1/terms/latest",
                "/api/v1/faqs",
                "/api/v1/faqs/**",

                // Webhook endpoints
                "/api/v1/paystack-webhook/**",
                "/api/v1/payments/m/callback",

                // Health check endpoints
                "/actuator/health",
                "/actuator/info"
        };
    }

    @Bean
    public CustomAuthenticationEntryPoint customAuthenticationEntryPoint() {
        return new CustomAuthenticationEntryPoint();
    }

    /**
     * CORS configuration
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://skillbridge-site.onrender.com",
                "http://localhost:3000"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "X-CSRF-Token",
                "Accept",
                "Origin",
                "Idempotency-Key"
        ));

        configuration.setExposedHeaders(Arrays.asList(
                "X-CSRF-Token",
                "Authorization"
        ));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Simple rate limiting filter (per IP + path, in-memory)
     */
    @Bean
    public WebFilter rateLimitingFilter() {
        return new WebFilter() {
            private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
            private final ConcurrentHashMap<String, Long> lastReset = new ConcurrentHashMap<>();

            @Override
            public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
                String clientIp = getClientIp(exchange);
                String key = clientIp + ":" + exchange.getRequest().getPath().value();

                long now = System.currentTimeMillis();
                long lastResetTime = lastReset.getOrDefault(key, 0L);

                // Reset every 60 seconds
                if (now - lastResetTime > 60000) {
                    requestCounts.put(key, new AtomicInteger(0));
                    lastReset.put(key, now);
                }

                AtomicInteger count = requestCounts.computeIfAbsent(key, k -> new AtomicInteger(0));
                int currentCount = count.incrementAndGet();

                if (currentCount > 100) {
                    exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                    return exchange.getResponse().setComplete();
                }

                return chain.filter(exchange);
            }

            private String getClientIp(ServerWebExchange exchange) {
                String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return exchange.getRequest().getRemoteAddress() != null
                        ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                        : "unknown";
            }
        };
    }
}
