package com.albert.microservices.teaching.marketplace.security.service.impl;

import com.albert.microservices.teaching.marketplace.entities.Role;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.entities.UserRole;
import com.albert.microservices.teaching.marketplace.repositories.RoleRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRoleRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.UserRoleService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class UserRoleServiceImpl implements UserRoleService {
    private static final Logger logger = LoggerFactory.getLogger(UserRoleServiceImpl.class);
    private static final String PROCESS_NAME = "AssignRoleToUser";

    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserRoleServiceImpl(UserRoleRepository userRoleRepository, UserRepository userRepository, RoleRepository roleRepository) {
        this.userRoleRepository = userRoleRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public Mono<ApiResponse> assignRoleToUser(UserRole userRole) {
        long startTime = System.currentTimeMillis();
        String transactionId = java.util.UUID.randomUUID().toString();

        LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                "Starting role assignment to user",
                "UserID: " + userRole.getUserId() + ", RoleID: " + userRole.getRoleId(),
                null);

        Mono<User> userMono = userRepository.findById(userRole.getUserId())
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    String errorMsg = "User not found with ID: " + userRole.getUserId();
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_NOT_FOUND, errorMsg, errorMsg, null, null);
                    return Mono.error(new Exception(errorMsg));
                }));

        Mono<Role> roleMono = roleRepository.findById(userRole.getRoleId())
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    String errorMsg = "Role not found with ID: " + userRole.getRoleId();
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_NOT_FOUND, errorMsg, errorMsg, null, null);
                    return Mono.error(new Exception(errorMsg));
                }));

        return Mono.zip(userMono, roleMono)
                .flatMap(tuple -> {
                    User user = tuple.getT1();
                    Role role = tuple.getT2();

                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                            "User and role found, proceeding with assignment",
                            null, null);

                    return userRoleRepository.findByUserId(user.getUserId())
                            .flatMap(existingUserRole -> {
                                LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                                        "Existing role found for user, updating role",
                                        "Current RoleID: " + existingUserRole.getRoleId(), null);

                                return userRoleRepository.updateRoleForUser(user.getUserId(), role.getRoleId())
                                        .then(Mono.defer(() -> {
                                            long duration = System.currentTimeMillis() - startTime;
                                            LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, duration,
                                                    CODE_SUCCESS, OPERATION_SUCCESS,
                                                    null, "Updated role for user successfully");
                                            return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, null));
                                        }));
                            })
                            .switchIfEmpty(Mono.defer(() -> {
                                LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                                        "No existing role found, assigning new role",
                                        null, null);

                                UserRole newUserRole = new UserRole(user.getUserId(), role.getRoleId());
                                return userRoleRepository.save(newUserRole)
                                        .then(Mono.defer(() -> {
                                            long duration = System.currentTimeMillis() - startTime;
                                            LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, duration,
                                                    CODE_SUCCESS, OPERATION_SUCCESS,
                                                    null, "Assigned new role to user successfully");
                                            return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, null));
                                        }));
                            }));
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null));
                });
    }
}