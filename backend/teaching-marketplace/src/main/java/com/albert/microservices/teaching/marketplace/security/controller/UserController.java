package com.albert.microservices.teaching.marketplace.security.controller;

import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.security.request.ChangePasswordRequest;
import com.albert.microservices.teaching.marketplace.security.request.NewPasswordRequest;
import com.albert.microservices.teaching.marketplace.security.request.PasswordResetRequest;
import com.albert.microservices.teaching.marketplace.security.request.UserFilterRequest;
import com.albert.microservices.teaching.marketplace.security.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;


    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;

        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public Mono<ApiResponse> registerUser(@RequestBody @Valid User newUser) {
        return userService.createUser(newUser);

    }

    @GetMapping("/account/verify")
    public Mono<ApiResponse> verifyAccount(@RequestParam("token") String token) {
        return userService.verifyUserAccount(token);

    }

    @PutMapping("/disable/{userId}")
    public Mono<ApiResponse> disableUser(@PathVariable Integer userId, ServerWebExchange exchange) {
        return performUserAction(userId, exchange, "DISABLE_USER");
    }

    @PutMapping("/enable/{userId}")
    public Mono<ApiResponse> enableUser(@PathVariable Integer userId, ServerWebExchange exchange) {
        return performUserAction(userId, exchange, "ENABLE_USER");
    }


    @DeleteMapping("/delete/{userId}")
    public Mono<ApiResponse> deleteUser(@PathVariable Integer userId, ServerWebExchange exchange) {
        return performUserAction(userId, exchange, "DELETE_USER");

    }

    private Mono<ApiResponse> performUserAction(Integer userId, ServerWebExchange exchange, String permission) {
        return exchange.getPrincipal()
                .cast(Authentication.class)
                .flatMap(auth -> {
                    boolean hasRoleAdmin = auth.getAuthorities().stream()
                            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

                    if (hasRoleAdmin) {
                        switch (permission) {
                            case "DISABLE_USER":
                                return userService.disableUser(userId)
                                        .then(Mono.just(ApiResponse.createResponse(200, "user disabled successfully", " success", null)));
                            case "ENABLE_USER":
                                return userService.enableUser(userId)
                                        .then(Mono.just(ApiResponse.createResponse(200, "user enabled successfully", " success", null)));
                            case "DELETE_USER":
                                return userService.deleteUser(userId)
                                        .then(Mono.just(ApiResponse.createResponse(200, "user deleted successfully", " success", null)));
                            default:
                                return Mono.just(ApiResponse.createResponse(400, "Bad Request", "Unknown operation", null));
                        }
                    } else {
                        return Mono.just(ApiResponse.createResponse(403, "Forbidden", "You do not have permission to perform this operation", null));
                    }
                });
    }



    @GetMapping("/all")
    public Mono<ApiResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{userId}")
    public Mono<ApiResponse> getUserById(@PathVariable Integer userId) {
        return userService.getUserById(userId);
    }
    @GetMapping("/info/{userId}")
    public Mono<ApiResponse> getUserByUserId(@PathVariable Integer userId) {
        return userService.getUserByUserId(userId);
    }

    @GetMapping("/me")
    public Mono<ApiResponse> getCurrentUserInfo() {
        return userService.getCurrentUserInfo();
    }
    @PostMapping("/change-password")
    public Mono<ResponseEntity<ApiResponse>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid ChangePasswordRequest request) {
        // Extract token from Authorization header (removing "Bearer " prefix)
        String token = authHeader.substring(7);

        // Get user ID from token
        Integer userId = jwtUtil.extractUserId(token);

        return userService.changePassword(
                userId,
                request.getOldPassword(),
                request.getNewPassword(),
                request.getConfirmPassword()
        ).map(ResponseEntity::ok);
    }
    @GetMapping("/filter")
    public Mono<ApiResponse> filterUsers(
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) Boolean activeStatus,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        UserFilterRequest filterRequest = new UserFilterRequest(
                roleName,
                activeStatus,
                searchTerm,
                page,
                size
        );

        return userService.getUsersByFilters(filterRequest);
    }
    @PostMapping("/request-password-reset")
    public Mono<ResponseEntity<ApiResponse>> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        return userService.requestPasswordReset(request.getEmail())
                .map(ResponseEntity::ok);
    }

    @PostMapping("/reset-password")
    public Mono<ResponseEntity<ApiResponse>> resetPassword(@RequestBody NewPasswordRequest request) {
        return userService.resetPassword(
                request.getToken(),
                request.getNewPassword(),
                request.getConfirmPassword()
        ).map(ResponseEntity::ok);
    }
}
