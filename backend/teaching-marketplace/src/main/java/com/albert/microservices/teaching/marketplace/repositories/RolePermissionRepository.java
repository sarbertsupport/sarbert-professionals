package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.Permission;
import com.albert.microservices.teaching.marketplace.entities.RolePermission;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface RolePermissionRepository extends ReactiveCrudRepository<RolePermission, Integer> {
    Mono<Void> deleteByRoleIdAndPermissionId(Integer roleId, Integer permissionId);
    Flux<RolePermission> findByRoleId(int roleId);
    Mono<RolePermission> findByRoleIdAndPermissionId(int roleId,int permissionId);
    Flux<Permission> findBy(Integer userId);
}
