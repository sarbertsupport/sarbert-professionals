package com.albert.microservices.teaching.marketplace.security.service;

import com.albert.microservices.teaching.marketplace.entities.UserRole;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface UserRoleService {
     Mono<ApiResponse> assignRoleToUser(UserRole userRole);

    }
