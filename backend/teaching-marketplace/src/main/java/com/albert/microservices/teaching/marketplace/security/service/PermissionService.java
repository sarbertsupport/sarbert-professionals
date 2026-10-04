package com.albert.microservices.teaching.marketplace.security.service;


import com.albert.microservices.teaching.marketplace.entities.Permission;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface PermissionService {
    Mono<ApiResponse> createPermission(Permission permission);

    Mono<ApiResponse> getAllPermissions();

    Mono<ApiResponse> getPermissionById(Integer permissionId);

    Mono<ApiResponse> updatePermission(Integer permissionId, Permission permission);

    Mono<ApiResponse> deletePermission(Integer roleId);
}
