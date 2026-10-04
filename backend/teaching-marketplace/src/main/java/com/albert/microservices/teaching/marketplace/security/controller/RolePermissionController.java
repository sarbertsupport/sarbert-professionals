package com.albert.microservices.teaching.marketplace.security.controller;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.request.PermissionUpdateRequest;
import com.albert.microservices.teaching.marketplace.security.service.RolePermissionService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/v1")
public class RolePermissionController {
    private final RolePermissionService rolePermissionService;

    public RolePermissionController(RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    @PostMapping("/rolepermissions/assign")
    public Mono<ApiResponse> assignPermissionsToRole(@RequestBody PermissionUpdateRequest request) {
        return rolePermissionService.assignPermissionsToRole(request.getRole(), request.getPermissionIds());
    }
}
