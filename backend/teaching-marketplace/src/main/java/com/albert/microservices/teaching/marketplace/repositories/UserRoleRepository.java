package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.UserRole;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface UserRoleRepository extends ReactiveCrudRepository<UserRole, Integer> {
    Mono<UserRole> findByRoleId(int roleId);

    Mono<UserRole> findByUserId(int userId);

    Mono<UserRole> findByUserIdAndRoleId(int userId, int roleId);

    @Modifying
    @Query("UPDATE user_roles SET role_id = :roleId WHERE user_id = :userId")
    Mono<Void> updateRoleForUser(Integer userId, Integer roleId);
}