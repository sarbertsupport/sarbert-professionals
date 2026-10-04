package com.albert.microservices.teaching.marketplace.security.controller;


import com.albert.microservices.teaching.marketplace.entities.Role;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.RoleService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/v1")
public class RolesController {
    private final RoleService roleService;

    public RolesController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping("/roles")
    public Mono<ApiResponse> createRole(@RequestBody Role role) {
        return roleService.createRole(role);
    }

    @GetMapping("/roles")
    public Mono<ApiResponse> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/roles/{id}")
    public Mono<ApiResponse> getRoleById(@PathVariable Integer id) {
        return roleService.getRoleById(id);
    }

    @PutMapping("/roles/{id}")
    public Mono<ApiResponse> updateRole(@PathVariable Integer id, @RequestBody Role role) {
        return roleService.updateRole(id, role);
    }

    @DeleteMapping("/roles/{id}")
    public Mono<ApiResponse> deleteRole(@PathVariable Integer id) {
        return roleService.deleteRole(id);
    }
}
