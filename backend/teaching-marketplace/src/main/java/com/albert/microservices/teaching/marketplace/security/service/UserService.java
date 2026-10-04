package com.albert.microservices.teaching.marketplace.security.service;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.request.UserFilterRequest;
import reactor.core.publisher.Mono;

public interface UserService {
    Mono<ApiResponse> createUser(User newUser);
    Mono<ApiResponse> verifyUserAccount(String token);
    Mono<ApiResponse> disableUser(Integer userId);
    Mono<ApiResponse> enableUser(Integer userId);
    Mono<ApiResponse> deleteUser(Integer userId);
    Mono<Integer> getUserIdByEmail(String email);
    Mono<ApiResponse> getUserById(Integer userId);
    Mono<ApiResponse> getAllUsers();
    Mono<ApiResponse> getCurrentUserInfo();
    Mono<ApiResponse> getUserByUserId(Integer userId);
    Mono<ApiResponse> getUsersByFilters(UserFilterRequest filterRequest);
    Mono<ApiResponse> changePassword(Integer userId, String oldPassword, String newPassword, String confirmPassword);
    Mono<ApiResponse> requestPasswordReset(String email);
    Mono<ApiResponse> resetPassword(String token, String newPassword, String confirmPassword);
}
