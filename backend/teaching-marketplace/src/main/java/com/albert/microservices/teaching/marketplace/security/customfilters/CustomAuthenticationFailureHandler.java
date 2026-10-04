package com.albert.microservices.teaching.marketplace.security.customfilters;


import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import reactor.core.publisher.Mono;

public class CustomAuthenticationFailureHandler implements ServerAuthenticationFailureHandler {
    private static final int MAX_ATTEMPTS = 3;
    private final UserRepository userRepository;

    public CustomAuthenticationFailureHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Mono<Void> onAuthenticationFailure(WebFilterExchange webFilterExchange, AuthenticationException exception) {

        return null;
    }
}
