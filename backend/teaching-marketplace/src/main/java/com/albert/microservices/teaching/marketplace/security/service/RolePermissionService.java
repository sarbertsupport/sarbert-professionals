package com.albert.microservices.teaching.marketplace.security.service;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

import java.util.List;

public interface RolePermissionService {
    Mono<ApiResponse> assignPermissionsToRole(Integer roleId, List<Integer> permissionIds);

}
