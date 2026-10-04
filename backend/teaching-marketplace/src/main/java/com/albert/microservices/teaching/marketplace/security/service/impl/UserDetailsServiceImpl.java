package com.albert.microservices.teaching.marketplace.security.service.impl;

import com.albert.microservices.teaching.marketplace.entities.Role;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements ReactiveUserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    public UserDetailsServiceImpl(UserRepository userRepository, RoleRepository roleRepository,UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Mono<UserDetails> findByUsername(String username) {
        return userRepository.findByEmail(username)
                .doOnNext(user -> log.debug("Authenticated lookup resolved for email={}", user.getEmail()))
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found with email: " + username)))
                .flatMap(user -> userRoleRepository.findByUserId(user.getUserId())
                        .flatMap(userRole -> roleRepository.findByRoleId(userRole.getRoleId())
                                .map(role -> createUserDetails(user, role))
                        )
                );
    }

    private UserDetailsImpl createUserDetails(User user, Role role) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role.getRoleName()));

        return new UserDetailsImpl(
                user.getEmail(),
                user.getPassword(),
                user.getActiveStatus(),
                user.getLocked(),
                user.getEmail(),
                authorities
        );
    }

}
