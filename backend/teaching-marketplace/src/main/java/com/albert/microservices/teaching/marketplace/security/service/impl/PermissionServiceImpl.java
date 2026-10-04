package com.albert.microservices.teaching.marketplace.security.service.impl;

import com.albert.microservices.teaching.marketplace.entities.Permission;
import com.albert.microservices.teaching.marketplace.repositories.PermissionRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.PermissionService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class PermissionServiceImpl implements PermissionService {
    private static final Logger logger = LoggerFactory.getLogger(PermissionServiceImpl.class);
    private static final String SERVICE_NAME = "PermissionService";

    private final PermissionRepository permissionRepository;

    public PermissionServiceImpl(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Override
    public Mono<ApiResponse> createPermission(Permission permission) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "createPermission";
        long startTime = System.currentTimeMillis();

        return permissionRepository.findByPermissionName(permission.getPermissionName())
                .flatMap(dbPermission -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_CONFLICT,
                            "Permission already exists",
                            "Permission with name: " + permission.getPermissionName() + " already exists",
                            permission.toString(),
                            null);

                    return Mono.just(ApiResponse.createResponse(CODE_CONFLICT, CONFLICT_ROLE, CONFLICT, null));
                })
                .switchIfEmpty(permissionRepository.save(permission)
                        .map(savedPermission -> {
                            LoggingUtility.logInfo(logger, transactionId, processName,
                                    System.currentTimeMillis() - startTime,
                                    CODE_SUCCESS,
                                    "Permission created successfully",
                                    permission.toString(),
                                    savedPermission.toString());

                            return ApiResponse.createResponse(CODE_SUCCESS, SUCCESS_ROLE, SUCCESS, savedPermission);
                        })
                        .doOnError(error -> {
                            LoggingUtility.logError(logger, transactionId, processName,
                                    System.currentTimeMillis() - startTime,
                                    CODE_SERVER_ERROR,
                                    "Failed to create permission",
                                    error.getMessage(),
                                    permission.toString(),
                                    null);
                        }));
    }

    @Override
    public Mono<ApiResponse> getAllPermissions() {
        String transactionId = UUID.randomUUID().toString();
        String processName = "getAllPermissions";
        long startTime = System.currentTimeMillis();

        return permissionRepository.findAll()
                .collectList()
                .flatMap(permissions -> {
                    if (permissions.isEmpty()) {
                        LoggingUtility.logWarn(logger, transactionId, processName,
                                System.currentTimeMillis() - startTime,
                                CODE_NOT_FOUND,
                                "No permissions found",
                                "Permission repository returned empty list",
                                null,
                                null);

                        return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                    } else {
                        LoggingUtility.logInfo(logger, transactionId, processName,
                                System.currentTimeMillis() - startTime,
                                CODE_SUCCESS,
                                "Retrieved all permissions",
                                null,
                                "Found " + permissions.size() + " permissions");

                        return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, permissions));
                    }
                })
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to retrieve permissions",
                            error.getMessage(),
                            null,
                            null);
                });
    }

    @Override
    public Mono<ApiResponse> getPermissionById(Integer permissionId) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "getPermissionById";
        long startTime = System.currentTimeMillis();

        return permissionRepository.findById(permissionId)
                .map(permission -> {
                    LoggingUtility.logInfo(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SUCCESS,
                            "Permission retrieved successfully",
                            "permissionId: " + permissionId,
                            permission.toString());

                    return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, permission);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_NOT_FOUND,
                            "Permission not found",
                            "No permission found with ID: " + permissionId,
                            null,
                            null);

                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }))
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to retrieve permission",
                            error.getMessage(),
                            "permissionId: " + permissionId,
                            null);
                });
    }
    @Override
    public Mono<ApiResponse> updatePermission(Integer permissionId, Permission permission) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "updatePermission";
        long startTime = System.currentTimeMillis();

        return permissionRepository.findById(permissionId)
                .flatMap(existingPermission -> {
                    existingPermission.setPermissionName(permission.getPermissionName());
                    existingPermission.setDescription(permission.getDescription());

                    return permissionRepository.save(existingPermission)
                            .map(updatedPermission -> {
                                LoggingUtility.logInfo(logger, transactionId, processName,
                                        System.currentTimeMillis() - startTime,
                                        CODE_SUCCESS,
                                        "Permission updated successfully",
                                        permission.toString(),
                                        updatedPermission.toString());

                                return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, updatedPermission);
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_NOT_FOUND,
                            "Permission not found",
                            "No permission found with ID: " + permissionId,
                            permission.toString(),
                            null);

                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }))
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to update permission",
                            error.getMessage(),
                            permission.toString(),
                            null);
                });
    }

    @Override
    public Mono<ApiResponse> deletePermission(Integer permissionId) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "deletePermission";
        long startTime = System.currentTimeMillis();

        return permissionRepository.findById(permissionId)
                .flatMap(existingPermission -> permissionRepository.delete(existingPermission)
                        .then(Mono.just(ApiResponse.createResponse(CODE_SUCCESS, SUCCESS, SUCCESS, null)))
                        .doOnSuccess(response -> {
                            LoggingUtility.logInfo(logger, transactionId, processName,
                                    System.currentTimeMillis() - startTime,
                                    CODE_SUCCESS,
                                    "Permission deleted successfully",
                                    "permissionId: " + permissionId,
                                    null);
                        })
                )
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_NOT_FOUND,
                            "Permission not found",
                            "No permission found with ID: " + permissionId,
                            null,
                            null);

                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }))
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to delete permission",
                            error.getMessage(),
                            "permissionId: " + permissionId,
                            null);
                });
    }
}