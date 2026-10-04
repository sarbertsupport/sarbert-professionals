package com.albert.microservices.teaching.marketplace.security.controller;

import com.albert.microservices.teaching.marketplace.entities.UserRole;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.UserRoleService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class UserRoleController {
    private final UserRoleService userRoleService;

    public UserRoleController(UserRoleService userRoleService) {
        this.userRoleService = userRoleService;
    }

    @PostMapping("/users/assign/role")
    public Mono<ApiResponse> assignRoleToUser(@RequestBody UserRole request) {
        return userRoleService.assignRoleToUser(request);
    }
}
