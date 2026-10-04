package com.albert.microservices.teaching.marketplace.security.customfilters;

import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import reactor.core.publisher.Mono;

public class CustomAuthenticationSuccessHandler implements ServerAuthenticationSuccessHandler {
    private final UserRepository userRepository;

    public CustomAuthenticationSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .flatMap(user -> {
                    user.setLoginAttempts(0);
                    return userRepository.save(user);
                }).then();
    }
}
