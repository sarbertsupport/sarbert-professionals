package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.Permission;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface PermissionRepository extends ReactiveCrudRepository<Permission, Integer> {
    Mono<Permission> findByPermissionName(String permissionName);

    Mono<Permission> findByPermissionId(int permissionId);
}
