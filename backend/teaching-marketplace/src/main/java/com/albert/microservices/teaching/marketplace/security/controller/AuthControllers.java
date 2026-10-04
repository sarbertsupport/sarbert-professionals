package com.albert.microservices.teaching.marketplace.security.controller;

import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.repositories.RoleRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRoleRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.request.LoginRequest;
import com.albert.microservices.teaching.marketplace.security.service.LoginJwtResponseService;
import com.albert.microservices.teaching.marketplace.services.AdminMfaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthControllers {

    private final ReactiveAuthenticationManager authenticationManager;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AdminMfaService adminMfaService;
    private final LoginJwtResponseService loginJwtResponseService;

    public AuthControllers(ReactiveAuthenticationManager authenticationManager,
                           UserRoleRepository userRoleRepository,
                           RoleRepository roleRepository,
                           UserRepository userRepository,
                           AdminMfaService adminMfaService,
                           LoginJwtResponseService loginJwtResponseService) {
        this.authenticationManager = authenticationManager;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.adminMfaService = adminMfaService;
        this.loginJwtResponseService = loginJwtResponseService;
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<ApiResponse>> login(@RequestBody @Valid LoginRequest authRequest) {
        // First try to find user by email
        Mono<User> userByEmail = userRepository.findByEmail(authRequest.getUsername());
        // Then try to find user by username if email not found
        Mono<User> userByUsername = userRepository.findByUsername(authRequest.getUsername());

        // Combine both lookups with switchIfEmpty
        return userByEmail
                .switchIfEmpty(userByUsername)
                .flatMap(user -> {
                    if (user.getActiveStatus() == null || !user.getActiveStatus()) {
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.createResponse(401,
                                        "Account is inactive please contact skillbridge@test.com for support",
                                        "Error", null)));
                    }

                    // Proceed with authentication using the actual username (email or username)
                    Authentication auth = new UsernamePasswordAuthenticationToken(
                            user.getEmail(), // Use the email for authentication
                            authRequest.getPassword()
                    );

                    return authenticationManager.authenticate(auth)
                            .flatMap(authentication ->
                                    userRepository.findById(user.getUserId())
                                            .switchIfEmpty(Mono.just(user))
                                            .flatMap(freshUser ->
                                                    userRoleRepository.findByUserId(freshUser.getUserId())
                                                            .flatMap(ur -> roleRepository.findById(ur.getRoleId()))
                                                            .flatMap(role -> {
                                                                if (!"ROLE_ADMIN".equalsIgnoreCase(role.getRoleName())) {
                                                                    return loginJwtResponseService.buildJwtResponse(
                                                                            freshUser.getEmail(), authentication);
                                                                }
                                                                return adminMfaService.maybeRequireAdminMfa(freshUser, authentication);
                                                            })
                                            )
                            )
                            .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                    .body(ApiResponse.createResponse(401, "Invalid Credentials", "Error", null))));
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.createResponse(401, "User not found", "Error", null))));
    }
}