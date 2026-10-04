package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.security.request.UserNameDTO;
import com.albert.microservices.teaching.marketplace.security.request.UserResponse;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Repository
public interface UserRepository extends ReactiveCrudRepository<User, Integer> {

    @Query("SELECT email, username FROM users WHERE user_id = :userId")
    Mono<AdminUserContact> findAdminContactByUserId(@Param("userId") Integer userId);

    Mono<User> findByUsername(String username);
    Mono<User> findByEmail(String email);
    Mono<User> findByActivationToken(String token);
    Mono<UserNameDTO> findByUserId(int userId);

    Flux<User> findByRoleId(Integer roleId);
    @Query("select u.user_id,u.username,u.email,u.active_status,\n" +
            "u.login_attempts,u.last_login_attempt,u.locked,r.role_name,\n" +
            "u.current_step,u.created_at from users u\n" +
            "join roles r on (u.role_id=r.role_id) ")
    Flux<UserResponse> findAllUsers();
    @Query("select u.user_id,u.username,u.email,u.active_status,\n" +
            "u.login_attempts,u.last_login_attempt,u.locked,r.role_name,\n" +
            "u.current_step,u.created_at from users u\n" +
            "join roles r on (u.role_id=r.role_id) where u.user_id = :userId ")
    Mono<UserResponse> findUserByUserId(int userId);
    @Modifying
    @Query("UPDATE users SET login_attempts = :loginAttempts, locked = :locked WHERE email = :email")
    Mono<Void> updateLoginAttemptsAndLockStatus(String email, int loginAttempts, boolean locked);

    @Query("""
        SELECT u.user_id, u.username, u.email, u.active_status, 
               u.login_attempts, u.last_login_attempt, u.locked, r.role_name,
               u.current_step, u.created_at
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE (:roleName IS NULL OR r.role_name = :roleName)
        AND (:activeStatus IS NULL OR u.active_status = :activeStatus)
        AND (:searchTerm IS NULL OR 
             LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR 
             LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        ORDER BY u.user_id
        LIMIT :size OFFSET :offset
        """)
    Flux<UserResponse> findUsersByFilters(
            @Param("roleName") String roleName,
            @Param("activeStatus") Boolean activeStatus,
            @Param("searchTerm") String searchTerm,
            @Param("size") int size,
            @Param("offset") int offset
    );

    @Query("""
        SELECT COUNT(u)
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE (:roleName IS NULL OR r.role_name = :roleName)
        AND (:activeStatus IS NULL OR u.active_status = :activeStatus)
        AND (:searchTerm IS NULL OR 
             LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR 
             LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        """)
    Mono<Long> countUsersByFilters(
            @Param("roleName") String roleName,
            @Param("activeStatus") Boolean activeStatus,
            @Param("searchTerm") String searchTerm
    );
    Mono<User> findByEmailOrUsername(String email, String username);

    Mono<User> findByResetToken(String token);

    @Modifying
    @Query("UPDATE users SET reset_token = :token, reset_token_expiration = :expiration WHERE email = :email")
    Mono<Void> updateResetToken(String email, String token, LocalDateTime expiration);

    @Modifying
    @Query("UPDATE users SET password = :password, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = :token")
    Mono<Void> updatePasswordByResetToken(String token, String password);

    @Modifying
    @Query("UPDATE users SET mfa_enabled = :enabled WHERE user_id = :userId")
    Mono<Void> updateMfaEnabled(Integer userId, Boolean enabled);

    @Modifying
    @Query("UPDATE users SET mfa_failed_attempts = :attempts, mfa_locked_until = :lockedUntil WHERE user_id = :userId")
    Mono<Void> updateMfaLockState(Integer userId, Integer attempts, LocalDateTime lockedUntil);
}
