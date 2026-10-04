package com.albert.microservices.teaching.marketplace.security.customfilters;

import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomReactiveAuthenticationManager implements ReactiveAuthenticationManager {
    private final ReactiveUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public CustomReactiveAuthenticationManager(ReactiveUserDetailsService userDetailsService,
                                               PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String credentials = authentication.getCredentials().toString();

        // Check if the credentials are likely to be a JWT token
        if (isLikelyJwtToken(credentials)) {
            if (jwtUtil.validateTokenWithoutUsername(credentials)) {
                return validateAndParseToken(credentials);
            } else {
                return Mono.error(new BadCredentialsException("Invalid or expired JWT token"));
            }
        } else {
            return authenticateByUsernameAndPassword(authentication);
        }
    }

    private boolean isLikelyJwtToken(String credentials) {
        return credentials != null && credentials.split("\\.").length == 3;
    }

    private Mono<Authentication> validateAndParseToken(String token) {
        try {
            if (!jwtUtil.isTokenExpired(token)) {
                String username = jwtUtil.extractUsername(token);
                return userDetailsService.findByUsername(username)
                        .map(userDetails -> new UsernamePasswordAuthenticationToken(userDetails, token, userDetails.getAuthorities()));
            } else {
                return Mono.error(new Exception("Token expired"));
            }
        } catch (Exception e) {
            return Mono.error(new Exception("Invalid token"));
        }
    }

    private Mono<Authentication> authenticateByUsernameAndPassword(Authentication authentication) {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        return userDetailsService.findByUsername(username)
                .flatMap(userDetails -> {
                    if (passwordEncoder.matches(password, userDetails.getPassword())) {
                        return Mono.just(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
                    } else {
                        return Mono.error(new BadCredentialsException("Invalid username/password"));
                    }
                });
    }
}
