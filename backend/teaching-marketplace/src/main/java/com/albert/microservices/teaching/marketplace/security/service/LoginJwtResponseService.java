package com.albert.microservices.teaching.marketplace.security.service;

import com.albert.microservices.teaching.marketplace.repositories.PermissionRepository;
import com.albert.microservices.teaching.marketplace.repositories.RolePermissionRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRoleRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.stream.Collectors;

/**
 * Builds the standard login success response with JWT after authentication has succeeded.
 */
@Service
@RequiredArgsConstructor
public class LoginJwtResponseService {

    private final UserRoleRepository userRoleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public Mono<ResponseEntity<ApiResponse>> buildJwtResponse(String email, Authentication authentication) {
        return userService.getUserIdByEmail(email)
                .flatMap(userId ->
                        userRoleRepository.findByUserId(userId)
                                .flatMap(userRole ->
                                        rolePermissionRepository.findByRoleId(userRole.getRoleId())
                                                .flatMap(rolePermission ->
                                                        permissionRepository.findByPermissionId(rolePermission.getPermissionId())
                                                )
                                                .collectList()
                                )
                                .map(rolePermissionsList -> rolePermissionsList.stream()
                                        .map(rp -> rp.getPermissionName())
                                        .collect(Collectors.joining(","))
                                )
                                .flatMap(permissions -> {
                                    String roles = authentication.getAuthorities().stream()
                                            .map(GrantedAuthority::getAuthority)
                                            .filter(r -> r.startsWith("ROLE_"))
                                            .collect(Collectors.joining(","));
                                    String jwt = jwtUtil.generateToken(email, userId, roles, permissions);
                                    return Mono.just(ResponseEntity.ok(
                                            ApiResponse.createResponse(200, "Login successful", "Success", jwt)
                                    ));
                                })
                );
    }
}
