package com.albert.microservices.teaching.marketplace.security.service;


import com.albert.microservices.teaching.marketplace.entities.Role;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface RoleService {
    Mono<ApiResponse> createRole(Role role);

    Mono<ApiResponse> getAllRoles();

    Mono<ApiResponse> getRoleById(Integer roleId);

    Mono<ApiResponse> updateRole(Integer roleId, Role role);

    Mono<ApiResponse> deleteRole(Integer roleId);
}
