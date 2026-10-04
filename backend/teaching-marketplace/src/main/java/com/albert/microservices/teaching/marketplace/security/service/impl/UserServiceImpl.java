package com.albert.microservices.teaching.marketplace.security.service.impl;

import com.albert.microservices.teaching.marketplace.entities.*;
import com.albert.microservices.teaching.marketplace.repositories.ChatMessageRepository;
import com.albert.microservices.teaching.marketplace.repositories.RoleRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRoleRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.request.UserDto;
import com.albert.microservices.teaching.marketplace.security.request.UserFilterRequest;
import com.albert.microservices.teaching.marketplace.security.request.UserResponse;
import com.albert.microservices.teaching.marketplace.security.service.UserService;
import com.albert.microservices.teaching.marketplace.services.EmailService;
import com.albert.microservices.teaching.marketplace.utils.LogSanitizer;
import com.albert.microservices.teaching.marketplace.utils.LoggerHelper;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.*;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;
import static com.albert.microservices.teaching.marketplace.utils.EmailUtils.getVerificationUrl;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TemplateEngine templateEngine;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final ChatMessageRepository chatMessageRepository;
    @Value("${spring.verification.host}")
    private String activationHost;
    @Value("${spring.reset.host}")
    private String resetHost;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService, TemplateEngine templateEngine, UserRoleRepository userRoleRepository, RoleRepository roleRepository, ChatMessageRepository chatMessageRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.templateEngine = templateEngine;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    @Override
    public Mono<ApiResponse> createUser(User newUser) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "createUser", null, CODE_SUCCESS,
                "Starting user creation process", "", null);

        if (!newUser.getPassword().equalsIgnoreCase(newUser.getConfirmPassword())) {
            LoggingUtility.logWarn(logger, transactionId, "createUser",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "Password mismatch", PASSWORD_MISMATCH, "", null);
            return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, PASSWORD_MISMATCH, BAD_REQUEST, null));
        }

        String passwordError = validatePasswordComplexity(newUser.getPassword());
        if (passwordError != null) {
            LoggingUtility.logWarn(logger, transactionId, "createUser",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "Password complexity validation failed", passwordError,"", null);
            return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, passwordError, BAD_REQUEST, null));
        }

        return userRepository.findByUsername(newUser.getUsername())
                .flatMap(existingUser -> {
                    LoggingUtility.logWarn(logger, transactionId, "createUser",
                            System.currentTimeMillis() - startTime, CODE_CONFLICT,
                            "Username already exists", CONFLICT_USERNAME, "", null);
                    return Mono.just(ApiResponse.createResponse(CODE_CONFLICT, CONFLICT_USERNAME, CONFLICT, null));
                })
                .switchIfEmpty(userRepository.findByEmail(newUser.getEmail())
                        .flatMap(existingEmail -> {
                            LoggingUtility.logWarn(logger, transactionId, "createUser",
                                    System.currentTimeMillis() - startTime, CODE_CONFLICT,
                                    "Email already exists", CONFLICT_EMAIL, "", null);
                            return Mono.just(ApiResponse.createResponse(CODE_CONFLICT, CONFLICT_EMAIL, CONFLICT, null));
                        })
                        .switchIfEmpty(Mono.defer(() -> {
                            String joinAs = newUser.getJoinAs();
                            String roleName = "ROLE_STUDENT"; // default
                            if ("Tutor".equalsIgnoreCase(joinAs)) {
                                roleName = "ROLE_TUTOR";
                            }

                            return roleRepository.findByRoleName(roleName)
                                    .flatMap(role -> {
                                        newUser.setRoleId(role.getRoleId());
                                        newUser.setActiveStatus(false);
                                        newUser.setLocked(false);
                                        newUser.setAccepted(true);
                                        newUser.setActivationToken(UUID.randomUUID().toString());
                                        newUser.setTokenExpiration(LocalDateTime.now().plusDays(1));
                                        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
                                        newUser.setCreatedAt(LocalDateTime.now());

                                        return userRepository.save(newUser)
                                                .flatMap(savedUser -> {
                                                    UserRole userRole = new UserRole(savedUser.getUserId(), role.getRoleId());
                                                    return userRoleRepository.save(userRole)
                                                            .then(mapToUserDto(savedUser));
                                                })
                                                .doOnSuccess(userDto -> {
                                                    LoggingUtility.logInfo(logger, transactionId, "createUser",
                                                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                                            "User created successfully, sending verification email", null,"");
                                                    sendVerificationEmail(newUser.getUsername(), newUser.getEmail(), newUser.getActivationToken())
                                                            .subscribe(null, error -> {
                                                                LoggingUtility.logError(logger, transactionId, "createUser",
                                                                        System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                                                                        "Failed to send verification email", error.getMessage(), "", null);
                                                            });
                                                })
                                                .map(userDto -> {
                                                    LoggingUtility.logInfo(logger, transactionId, "createUser",
                                                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                                            SUCCESS_CREATE, null, "");
                                                    return ApiResponse.createResponse(CODE_SUCCESS, SUCCESS_CREATE, SUCCESS, userDto);
                                                });
                                    });
                        }))
                )
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "createUser",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error creating user", e.getMessage(), "", null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> verifyUserAccount(String token) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "verifyUserAccount", null, CODE_VALIDATION,
                "Starting account verification", LogSanitizer.credentialMeta(token), null);

        return userRepository.findByActivationToken(token)
                .flatMap(user -> {
                    if (user.getTokenExpiration().isBefore(LocalDateTime.now())) {
                        LoggingUtility.logWarn(logger, transactionId, "verifyUserAccount",
                                System.currentTimeMillis() - startTime, CODE_VALIDATION,
                                "Activation token expired", EXPIRED_ACTIVATION_TOKEN, LogSanitizer.credentialMeta(token), null);
                        return Mono.just(ApiResponse.createResponse(CODE_VALIDATION,
                                EXPIRED_ACTIVATION_TOKEN, BAD_REQUEST, null));
                    }
                    user.setActiveStatus(true);
                    user.setActivationToken(null);
                    user.setTokenExpiration(null);
                    return userRepository.save(user)
                            .map(savedUser -> {
                                LoggingUtility.logInfo(logger, transactionId, "verifyUserAccount",
                                        System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                        ACCOUNT_VERIFICATION_SUCCESS, null, "");
                                return ApiResponse.createResponse(CODE_SUCCESS, ACCOUNT_VERIFICATION_SUCCESS, SUCCESS, null);
                            });
                }).switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "verifyUserAccount",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "Invalid activation token", INVALID_TOKEN, LogSanitizer.credentialMeta(token), null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, INVALID_TOKEN, NOTFOUND, null));
                })
                        .onErrorResume(e -> {
                            LoggingUtility.logError(logger, transactionId, "verifyUserAccount",
                                    System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                                    "Error verifying account", e.getMessage(), LogSanitizer.credentialMeta(token), null);
                            return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, ACTIVATION_ERROR, e.getMessage(), null));
                        }));
    }

    @Override
    public Mono<ApiResponse> disableUser(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "disableUser", null, CODE_VALIDATION,
                "Starting user disable process", userId.toString(), null);

        return userRepository.findById(userId)
                .flatMap(user -> {
                    user.setActiveStatus(false);
                    return userRepository.save(user);
                })
                .map(updatedUser -> {
                    LoggingUtility.logInfo(logger, transactionId, "disableUser",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            OPERATION_SUCCESS, null, userId.toString());
                    return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, mapToUserDto(updatedUser));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "disableUser",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "User not found", NOTFOUND, userId.toString(), null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                })
                        .onErrorResume(e -> {
                            LoggingUtility.logError(logger, transactionId, "disableUser",
                                    System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                                    "Error disabling user", e.getMessage(), userId.toString(), null);
                            return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, "Error disabling user", e.getMessage(), null));
                        }));
    }

    @Override
    public Mono<ApiResponse> enableUser(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "enableUser", null, CODE_VALIDATION,
                "Starting user enable process", userId.toString(), null);

        return userRepository.findById(userId)
                .flatMap(user -> {
                    user.setActiveStatus(true);
                    return userRepository.save(user);
                })
                .map(updatedUser -> {
                    LoggingUtility.logInfo(logger, transactionId, "enableUser",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            OPERATION_SUCCESS, null, userId.toString());
                    return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, mapToUserDto(updatedUser));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "enableUser",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "User not found", NOTFOUND, userId.toString(), null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }));
    }

    @Override
    public Mono<ApiResponse> deleteUser(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "deleteUser", null, CODE_VALIDATION,
                "Starting user deletion process", userId.toString(), null);

        return userRepository.findById(userId)
                .flatMap(user -> userRepository.delete(user)
                        .then(Mono.just(ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, null))))
                .doOnSuccess(response -> {
                    LoggingUtility.logInfo(logger, transactionId, "deleteUser",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            OPERATION_SUCCESS, null, userId.toString());
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "deleteUser",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "User not found", NOTFOUND, userId.toString(), null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null));
                }));
    }

    private Mono<UserDto> mapToUserDto(User user) {
        return userRoleRepository.findByUserId(user.getUserId())
                .flatMap(userRole -> roleRepository.findByRoleId(userRole.getRoleId())
                        .map(role -> {
                            UserDto dto = new UserDto();
                            dto.setUserId(user.getUserId());
                            dto.setUsername(user.getUsername());
                            dto.setEmail(user.getEmail());
                            dto.setActiveStatus(user.getActiveStatus());
                            dto.setLoginAttempts(user.getLoginAttempts());
                            dto.setLastLoginAttempt(user.getLastLoginAttempt());
                            dto.setLocked(user.getLocked());
                            dto.setRoleName(role.getRoleName());
                            dto.setRoleName(ProfileStep.PROFILE.toString());
                            dto.setJoinAs("ROLE_TUTOR".equals(role.getRoleName()) ? "Tutor" : "Student");
                            return dto;
                        }));
    }

    @Override
    public Mono<Integer> getUserIdByEmail(String email) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getUserIdByEmail", null, CODE_VALIDATION,
                "Getting user ID by email", email, null);

        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .doOnSuccess(userId -> {
                    LoggingUtility.logInfo(logger, transactionId, "getUserIdByEmail",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            "User ID retrieved", null, "");
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "getUserIdByEmail",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "User not found", "User not found", email, null);
                    return Mono.error(new RuntimeException("User not found"));
                }));
    }

    @Override
    public Mono<ApiResponse> getUserById(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getUserById", null, CODE_VALIDATION,
                "Getting user by ID", userId.toString(), null);

        return userRepository.findUserByUserId(userId)
                .map(user -> {
                    LoggingUtility.logInfo(logger, transactionId, "getUserById",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            "User retrieved", null, userId.toString());
                    return ApiResponse.createResponse(CODE_SUCCESS, "Success", SUCCESS, user);
                })
                .defaultIfEmpty(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null))
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "getUserById",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error getting user", e.getMessage(), userId.toString(), null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> getUserByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getUserByUserId", null, CODE_VALIDATION,
                "Getting user by user ID", userId.toString(), null);

        return userRepository.findByUserId(userId)
                .map(user -> {
                    LoggingUtility.logInfo(logger, transactionId, "getUserByUserId",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            "User retrieved", null, userId.toString());
                    return ApiResponse.createResponse(CODE_SUCCESS, "Success", SUCCESS, user);
                })
                .defaultIfEmpty(ApiResponse.createResponse(CODE_NOT_FOUND, NOTFOUND, NOTFOUND, null))
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "getUserByUserId",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error getting user", e.getMessage(), userId.toString(), null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> getAllUsers() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getAllUsers", null, CODE_VALIDATION,
                "Getting all users", null, null);

        return userRepository.findAllUsers()
                .collectList()
                .map(users -> {
                    LoggingUtility.logInfo(logger, transactionId, "getAllUsers",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            "Users retrieved", null, null);
                    return ApiResponse.createResponse(CODE_SUCCESS, "Success", SUCCESS, users);
                })
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "getAllUsers",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error getting users", e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> getCurrentUserInfo() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        return ReactiveSecurityContextHolder.getContext()
                .flatMap(securityContext -> {
                    Authentication authentication = securityContext.getAuthentication();

                    String email = authentication.getName();

                    return userRepository.findByEmail(email)
                            .flatMap(user -> {
                                Mono<Role> roleMono = roleRepository.findById(user.getRoleId());
                                Mono<Long> unreadCountMono = chatMessageRepository.countUnreadMessagesForRecipient(
                                        user.getUserId().longValue(),
                                        null);

                                return Mono.zip(roleMono, unreadCountMono)
                                        .map(tuple -> {
                                            Role role = tuple.getT1();
                                            Long unreadCount = tuple.getT2();

                                            UserDto dto = new UserDto();
                                            dto.setUserId(user.getUserId());
                                            dto.setUsername(user.getUsername());
                                            dto.setEmail(user.getEmail());
                                            dto.setActiveStatus(user.getActiveStatus());
                                            dto.setLoginAttempts(user.getLoginAttempts());
                                            dto.setLastLoginAttempt(user.getLastLoginAttempt());
                                            dto.setLocked(user.getLocked());
                                            dto.setRoleName(role.getRoleName());
                                            dto.setUnreadMessagesCount(unreadCount);

                                            if(role.getRoleName().equalsIgnoreCase("ROLE_TUTOR")) {
                                                dto.setJoinAs("Teacher");
                                            }
                                            if(role.getRoleName().equalsIgnoreCase("ROLE_STUDENT")) {
                                                dto.setJoinAs("Student");
                                            }
                                            dto.setStepName(user.getCurrentStep() != null ?
                                                    user.getCurrentStep().name() : "PROFILE");

                                            if (logger.isDebugEnabled()) {
                                                logger.debug("getCurrentUserInfo ok userId={} reqId={} {}ms",
                                                        dto.getUserId(), transactionId,
                                                        System.currentTimeMillis() - startTime);
                                            }

                                            return ApiResponse.createResponse(
                                                    CODE_SUCCESS,
                                                    "User fetched successfully",
                                                    SUCCESS,
                                                    dto);
                                        })
                                        .onErrorResume(ex -> {
                                            logger.error("Error fetching user details: {}", ex.getMessage());
                                            LoggingUtility.logError(logger, transactionId, "getCurrentUserInfo",
                                                    System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                                                    "Error fetching user details", ex.getMessage(), email, null);
                                            return Mono.just(ApiResponse.createResponse(
                                                    CODE_SERVER_ERROR,
                                                    "Failed to fetch user details",
                                                    ERROR,
                                                    null
                                            ));
                                        });
                            })
                            .switchIfEmpty(Mono.defer(() -> {
                                logger.warn("User not found in security context or DB!");
                                LoggingUtility.logWarn(logger, transactionId, "getCurrentUserInfo",
                                        System.currentTimeMillis() - startTime, UNAUTHORIZED,
                                        "User not authenticated", "User not found in security context or DB", email, null);
                                return Mono.just(ApiResponse.createResponse(
                                        UNAUTHORIZED,
                                        "User not authenticated",
                                        UNAUTHORIZED_VALUE,
                                        null
                                ));
                            }));
                });
    }



    @Override
    public Mono<ApiResponse> changePassword(Integer userId, String oldPassword, String newPassword, String confirmPassword) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "changePassword", null, CODE_VALIDATION,
                "Starting password change process", "userId: " + userId, null);

        if (!newPassword.equals(confirmPassword)) {
            LoggingUtility.logWarn(logger, transactionId, "changePassword",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "Password mismatch", PASSWORD_MISMATCH, "userId: " + userId, null);
            return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, PASSWORD_MISMATCH, BAD_REQUEST, null));
        }

        if (oldPassword.equals(newPassword)) {
            LoggingUtility.logWarn(logger, transactionId, "changePassword",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "New password same as old", "New password cannot be the same as old password", "userId: " + userId, null);
            return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "New password cannot be the same as old password", BAD_REQUEST, null));
        }

        String passwordError = validatePasswordComplexity(newPassword);
        if (passwordError != null) {
            LoggingUtility.logWarn(logger, transactionId, "changePassword",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "Password complexity failed", passwordError, "userId: " + userId, null);
            return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, passwordError, BAD_REQUEST, null));
        }

        return userRepository.findById(userId)
                .flatMap(user -> {
                    if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                        LoggingUtility.logWarn(logger, transactionId, "changePassword",
                                System.currentTimeMillis() - startTime, CODE_VALIDATION,
                                "Old password incorrect", "Old password is incorrect", "userId: " + userId, null);
                        return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Old password is incorrect", BAD_REQUEST, null));
                    }

                    user.setPassword(passwordEncoder.encode(newPassword));
                    return userRepository.save(user)
                            .map(updatedUser -> {
                                LoggingUtility.logInfo(logger, transactionId, "changePassword",
                                        System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                        "Password changed successfully", null, "userId: " + userId);
                                return ApiResponse.createResponse(CODE_SUCCESS, "Password changed successfully", SUCCESS, null);
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "changePassword",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "User not found", "User not found", "userId: " + userId, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "User not found", NOTFOUND, null));
                }))
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "changePassword",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error changing password", e.getMessage(), "userId: " + userId, null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR, "Error changing password", e.getMessage(), null));
                });
    }

    private String validatePasswordComplexity(String password) {
        if (password.length() < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter";
        }
        if (!password.matches(".*[a-z].*")) {
            return "Password must contain at least one lowercase letter";
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            return "Password must contain at least one special character";
        }
        return null;
    }

    @Override
    public Mono<ApiResponse> getUsersByFilters(UserFilterRequest filterRequest) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getUsersByFilters", null, CODE_VALIDATION,
                "Getting users by filters", filterRequest.toString(), null);

        int offset = (filterRequest.getPage() - 1) * filterRequest.getSize();

        return userRepository.findUsersByFilters(
                filterRequest.getRoleName(),
                filterRequest.getActiveStatus(),
                filterRequest.getSearchTerm(),
                filterRequest.getSize(),
                offset
        )
                .collectList()
                .zipWith(userRepository.countUsersByFilters(
                        filterRequest.getRoleName(),
                        filterRequest.getActiveStatus(),
                        filterRequest.getSearchTerm()
                ))
                .map(tuple -> {
                    List<UserResponse> users = tuple.getT1();
                    Long totalCount = tuple.getT2();

                    Map<String, Object> responseData = new HashMap<>();
                    responseData.put("users", users);
                    responseData.put("totalCount", totalCount);
                    responseData.put("currentPage", filterRequest.getPage());
                    responseData.put("totalPages", (int) Math.ceil((double) totalCount / filterRequest.getSize()));

                    LoggingUtility.logInfo(logger, transactionId, "getUsersByFilters",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            "Users filtered successfully", null, ""
                            );

                    return ApiResponse.createResponse(CODE_SUCCESS, "Success", SUCCESS, responseData);
                })
                .defaultIfEmpty(ApiResponse.createResponse(CODE_SUCCESS, "Success", SUCCESS, Collections.emptyMap()))
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "getUsersByFilters",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error filtering users", e.getMessage(), filterRequest.toString(), null);
                    return Mono.just(
                            ApiResponse.createResponse(CODE_SERVER_ERROR, SERVER_ERROR, e.getMessage(), null)
                    );
                });
    }
    @Override
    public Mono<ApiResponse> requestPasswordReset(String email) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "requestPasswordReset", null, CODE_VALIDATION,
                "Starting password reset request", LogSanitizer.maskEmail(email), null);

        return userRepository.findByEmail(email)
                .flatMap(user -> {
                    // Generate reset token
                    String resetToken = UUID.randomUUID().toString();
                    return userRepository.updateResetToken(email, resetToken, LocalDateTime.now().plusHours(24))
                            .then(sendPasswordResetEmail(user.getUsername(), email, resetToken))
                            .doOnSuccess(v -> {
                                LoggingUtility.logInfo(logger, transactionId, "requestPasswordReset",
                                        System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                        "Password reset email sent", null, LogSanitizer.maskEmail(email));
                            })
                            .thenReturn(ApiResponse.createResponse(CODE_SUCCESS,
                                    "Password reset link sent to your email", SUCCESS, null));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "requestPasswordReset",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "Email not found", "If this email exists, a reset link will be sent", LogSanitizer.maskEmail(email), null);
                    return Mono.just(ApiResponse.createResponse(CODE_SUCCESS,
                            "If this email exists, a reset link will be sent", SUCCESS, null));
                }))
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "requestPasswordReset",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error requesting password reset", e.getMessage(), LogSanitizer.maskEmail(email), null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR,
                            "Failed to process password reset request", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> resetPassword(String token, String newPassword, String confirmPassword) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "resetPassword", null, CODE_VALIDATION,
                "Starting password reset process", LogSanitizer.credentialMeta(token), null);

        if (!newPassword.equals(confirmPassword)) {
            LoggingUtility.logWarn(logger, transactionId, "resetPassword",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "Password mismatch", PASSWORD_MISMATCH, LogSanitizer.credentialMeta(token), null);
            return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, PASSWORD_MISMATCH, BAD_REQUEST, null));
        }

        String passwordError = validatePasswordComplexity(newPassword);
        if (passwordError != null) {
            LoggingUtility.logWarn(logger, transactionId, "resetPassword",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "Password complexity failed", passwordError, LogSanitizer.credentialMeta(token), null);
            return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, passwordError, BAD_REQUEST, null));
        }

        return userRepository.findByResetToken(token)
                .flatMap(user -> {
                    if (user.getResetTokenExpiration().isBefore(LocalDateTime.now())) {
                        LoggingUtility.logWarn(logger, transactionId, "resetPassword",
                                System.currentTimeMillis() - startTime, CODE_VALIDATION,
                                "Reset token expired", "Password reset token has expired", LogSanitizer.credentialMeta(token), null);
                        return Mono.just(ApiResponse.createResponse(CODE_VALIDATION,
                                "Password reset token has expired", BAD_REQUEST, null));
                    }

                    return userRepository.updatePasswordByResetToken(token, passwordEncoder.encode(newPassword))
                            .then(Mono.just(ApiResponse.createResponse(CODE_SUCCESS,
                                    "Password has been reset successfully", SUCCESS, null)));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "resetPassword",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "Invalid reset token", "Invalid password reset token", LogSanitizer.credentialMeta(token), null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND,
                            "Invalid password reset token", NOTFOUND, null));
                }))
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, "resetPassword",
                            System.currentTimeMillis() - startTime, CODE_SERVER_ERROR,
                            "Error resetting password", e.getMessage(), LogSanitizer.credentialMeta(token), null);
                    return Mono.just(ApiResponse.createResponse(CODE_SERVER_ERROR,
                            "Failed to reset password", e.getMessage(), null));
                });


    }
    private Mono<Void> sendVerificationEmail(String name, String email, String activationToken) {
        Context context = new Context();
        context.setVariables(Map.of("name", name, "url", getVerificationUrl(activationHost, activationToken)));
        String content = templateEngine.process("verificationemail", context);
        String subject = "Account Verification";
        return emailService.sendEmail(email, subject, content);
    }
    private Mono<Void> sendPasswordResetEmail(String name, String email, String resetToken) {
        Context context = new Context();
        context.setVariables(Map.of(
                "name", name,
                "url", getPasswordResetUrl(resetHost, resetToken),
                "expirationHours", 24 // Token valid for 24 hours
        ));

        String content = templateEngine.process("passwordresetemail", context);
        String subject = "Password Reset Request";
        return emailService.sendEmail(email, subject, content);
    }

    private String getPasswordResetUrl(String host, String token) {
        return host + "?token=" + token;
    }
}