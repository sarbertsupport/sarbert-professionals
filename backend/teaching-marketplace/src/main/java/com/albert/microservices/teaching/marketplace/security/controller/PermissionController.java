package com.albert.microservices.teaching.marketplace.security.controller;

import com.albert.microservices.teaching.marketplace.entities.Permission;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.PermissionService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/v1")
public class PermissionController {
    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping("/permissions")
    public Mono<ApiResponse> createRole(@RequestBody Permission permission) {
        return permissionService.createPermission(permission);
    }

    @GetMapping("/permissions")
    public Mono<ApiResponse> getAllRoles() {

        return permissionService.getAllPermissions();
    }

    @GetMapping("/permissions/{id}")
    public Mono<ApiResponse> getRoleById(@PathVariable Integer id) {
        return permissionService.getPermissionById(id);
    }

    @PutMapping("/permissions/{id}")
    public Mono<ApiResponse> updateRole(@PathVariable Integer id, @RequestBody Permission permission) {
        return permissionService.updatePermission(id, permission);
    }

    @DeleteMapping("/permissions/{id}")
    public Mono<ApiResponse> deleteRole(@PathVariable Integer id) {
        return permissionService.deletePermission(id);
    }
}
