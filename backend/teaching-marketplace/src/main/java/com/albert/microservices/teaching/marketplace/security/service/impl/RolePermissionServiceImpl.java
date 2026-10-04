package com.albert.microservices.teaching.marketplace.security.service.impl;

import com.albert.microservices.teaching.marketplace.entities.RolePermission;
import com.albert.microservices.teaching.marketplace.repositories.PermissionRepository;
import com.albert.microservices.teaching.marketplace.repositories.RolePermissionRepository;
import com.albert.microservices.teaching.marketplace.repositories.RoleRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.RolePermissionService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class RolePermissionServiceImpl implements RolePermissionService {
    private static final Logger logger = LoggerFactory.getLogger(RolePermissionServiceImpl.class);
    private static final String PROCESS_NAME = "AssignPermissionsToRole";

    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    public RolePermissionServiceImpl(RolePermissionRepository rolePermissionRepository, PermissionRepository permissionRepository, RoleRepository roleRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public Mono<ApiResponse> assignPermissionsToRole(Integer roleId, List<Integer> permissionIds) {
        long startTime = System.currentTimeMillis();
        String transactionId = java.util.UUID.randomUUID().toString();

        LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                "Starting permission assignment for role: " + roleId,
                "RoleID: " + roleId + ", PermissionIDs: " + permissionIds, null);

        return roleRepository.findById(roleId)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    String errorMessage = "Role not found with ID: " + roleId;
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_NOT_FOUND, errorMessage, errorMessage, null, null);
                    return Mono.error(new Exception(errorMessage));
                }))
                .flatMapMany(role -> {
                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                            "Role found, processing permissions", null, null);

                    return rolePermissionRepository.findByRoleId(role.getRoleId())
                            .collectList()
                            .flatMapMany(currentPermissions -> {
                                Set<Integer> currentPermissionIds = currentPermissions.stream()
                                        .map(RolePermission::getPermissionId)
                                        .collect(Collectors.toSet());
                                Set<Integer> newPermissionIds = new HashSet<>(permissionIds);
                                Set<Integer> toAdd = new HashSet<>(newPermissionIds);
                                toAdd.removeAll(currentPermissionIds);
                                Set<Integer> toRemove = new HashSet<>(currentPermissionIds);
                                toRemove.removeAll(newPermissionIds);

                                LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                                        String.format("Permission changes - To add: %d, To remove: %d", toAdd.size(), toRemove.size()),
                                        null, null);

                                Flux<Void> removeFlux = Flux.fromIterable(toRemove)
                                        .flatMap(idToRemove -> {
                                            LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                                                    "Removing permission: " + idToRemove, null, null);
                                            return rolePermissionRepository.deleteByRoleIdAndPermissionId(roleId, idToRemove);
                                        });

                                Flux<RolePermission> addFlux = Flux.fromIterable(toAdd)
                                        .flatMap(idToAdd -> {
                                            RolePermission newRolePermission = new RolePermission();
                                            newRolePermission.setRoleId(roleId);
                                            newRolePermission.setPermissionId(idToAdd);
                                            LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null, CODE_SUCCESS,
                                                    "Adding permission: " + idToAdd, null, null);
                                            return rolePermissionRepository.save(newRolePermission);
                                        });

                                return Flux.concat(removeFlux, addFlux);
                            });
                })
                .collectList()
                .map(list -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, duration, CODE_SUCCESS,
                            OPERATION_SUCCESS, null, SUCCESS);
                    return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, null);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null));
                });
    }
}