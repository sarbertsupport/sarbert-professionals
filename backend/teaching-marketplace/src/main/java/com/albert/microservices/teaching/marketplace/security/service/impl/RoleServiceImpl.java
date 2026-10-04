package com.albert.microservices.teaching.marketplace.security.service.impl;

import com.albert.microservices.teaching.marketplace.entities.Role;
import com.albert.microservices.teaching.marketplace.repositories.RoleRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.RoleService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class RoleServiceImpl implements RoleService {
    private static final Logger logger = LoggerFactory.getLogger(RoleServiceImpl.class);
    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Mono<ApiResponse> createRole(Role role) {
        long startTime = System.currentTimeMillis();
        String transactionId = java.util.UUID.randomUUID().toString();
        String processName = "CreateRole";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Starting role creation", role.toString(), null);

        return roleRepository.findByRoleName(role.getRoleName())
                .flatMap(dbRole -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration,
                            CODE_CONFLICT, CONFLICT_ROLE, "Role already exists", dbRole.toString(),"");
                    return Mono.just(ApiResponse.createResponse(CODE_CONFLICT, CONFLICT_ROLE, CONFLICT, null));
                })
                .switchIfEmpty(roleRepository.save(role)
                        .map(savedRole -> {
                            long duration = System.currentTimeMillis() - startTime;
                            LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                    CODE_SUCCESS, SUCCESS_ROLE, null, savedRole.toString());
                            return ApiResponse.createResponse(CODE_SUCCESS, SUCCESS_ROLE, SUCCESS, savedRole);
                        }));
    }

    @Override
    public Mono<ApiResponse> getAllRoles() {
        long startTime = System.currentTimeMillis();
        String transactionId = java.util.UUID.randomUUID().toString();
        String processName = "GetAllRoles";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Fetching all roles", null, null);

        return roleRepository.findAll()
                .collectList()
                .flatMap(roles -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (roles.isEmpty()) {
                        LoggingUtility.logWarn(logger, transactionId, processName, duration,
                                CODE_NOT_FOUND, NOTFOUND, "No roles found", null,"");
                        return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                    } else {
                        LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                CODE_SUCCESS, OPERATION_SUCCESS, null, "Found " + roles.size() + " roles");
                        return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, roles));
                    }
                });
    }

    @Override
    public Mono<ApiResponse> getRoleById(Integer roleId) {
        long startTime = System.currentTimeMillis();
        String transactionId = UUID.randomUUID().toString();
        String processName = "GetRoleById";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Fetching role by ID: " + roleId, null, null);

        return roleRepository.findById(roleId)
                .map(role -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                            CODE_SUCCESS, OPERATION_SUCCESS, null, role.toString());
                    return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, role);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, NOTFOUND, "Role not found with ID: " + roleId, null, "");
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }));
    }

    @Override
    public Mono<ApiResponse> updateRole(Integer roleId, Role role) {
        long startTime = System.currentTimeMillis();
        String transactionId = java.util.UUID.randomUUID().toString();
        String processName = "UpdateRole";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Updating role with ID: " + roleId, role.toString(), null);

        return roleRepository.findById(roleId)
                .flatMap(existingRole -> {
                    existingRole.setRoleName(role.getRoleName());
                    return roleRepository.save(existingRole)
                            .map(updatedRole -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                        CODE_SUCCESS, OPERATION_SUCCESS, null, updatedRole.toString());
                                return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, updatedRole);
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, NOTFOUND, "Role not found with ID: " + roleId, null,"");
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }));
    }

    @Override
    public Mono<ApiResponse> deleteRole(Integer roleId) {
        long startTime = System.currentTimeMillis();
        String transactionId = java.util.UUID.randomUUID().toString();
        String processName = "DeleteRole";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Deleting role with ID: " + roleId, null, null);

        return roleRepository.findById(roleId)
                .flatMap(existingRole -> roleRepository.delete(existingRole)
                        .then(Mono.defer(() -> {
                            long duration = System.currentTimeMillis() - startTime;
                            LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                    CODE_SUCCESS, SUCCESS, "Role deleted successfully", null);
                            return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, SUCCESS, SUCCESS, null));
                        }))
                )
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, RECORD_NOT_FOUND, "Role not found with ID: " + roleId, null,"");
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }));
    }
}