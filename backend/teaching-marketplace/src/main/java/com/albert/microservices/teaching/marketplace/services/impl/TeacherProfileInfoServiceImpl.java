package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.albert.microservices.teaching.marketplace.repositories.TeacherProfileInfoRepository;
import com.albert.microservices.teaching.marketplace.repositories.TeacherProfileRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeacherProfileInfoService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class TeacherProfileInfoServiceImpl implements TeacherProfileInfoService {
    private static final Logger logger = LoggerFactory.getLogger(TeacherProfileInfoServiceImpl.class);
    private final TeacherProfileInfoRepository teacherProfileInfoRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    public TeacherProfileInfoServiceImpl(TeacherProfileInfoRepository teacherProfileInfoRepository,
                                         TeacherProfileRepository teacherProfileRepository) {
        this.teacherProfileInfoRepository = teacherProfileInfoRepository;
        this.teacherProfileRepository = teacherProfileRepository;
    }

    @Override
    public Mono<ApiResponse> getTeacherDetailsByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getTeacherDetailsByUserId";

        if (userId == null) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logError(logger, transactionId, processName, duration,
                    CODE_VALIDATION, "Invalid user ID",
                    "Null userId provided", "userId=null", null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "User ID cannot be null",
                    BAD_REQUEST,
                    null));
        }

        return teacherProfileRepository.findByUserId(userId)
                .flatMap(teacher -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                            CODE_SUCCESS, "Teacher details retrieved successfully",
                            "userId=" + userId, "");
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Teacher found",
                            SUCCESS,
                            teacher));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, "Teacher not found",
                            "No teacher found for userId: " + userId,
                            "userId=" + userId, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Teacher not found",
                            NOTFOUND,
                            null));
                }))
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_SERVER_ERROR, "Error retrieving teacher details",
                            "Exception occurred: " + ex.getMessage(),
                            "userId=" + userId, ex.getMessage());
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error retrieving teacher details",
                            ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> getTeacherById(Long teacherId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getTeacherById";

        return teacherProfileInfoRepository.findById(teacherId)
                .map(teacher -> {
                    // Extract first name from fullName
                    String fullName = teacher.getFullName();
                    if (fullName != null && fullName.contains(" ")) {
                        String firstName = fullName.split(" ")[0];
                        teacher.setFullName(firstName);
                    }

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                            CODE_SUCCESS, "Teacher retrieved successfully",
                            "teacherId=" + teacherId, "");
                    return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, teacher);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, "Teacher not found",
                            "No teacher found for teacherId: " + teacherId,
                            "teacherId=" + teacherId, null);
                    return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, RECORD_NOT_FOUND, NOTFOUND, null));
                }));
    }

    @Override
    public Mono<ApiResponse> getAllTeachers() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getAllTeachers";

        return teacherProfileInfoRepository.findAll()
                .collectList()
                .map(teachers -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                            CODE_SUCCESS, "All teachers retrieved successfully",
                            "-", "");
                    return ApiResponse.createResponse(CODE_SUCCESS, OPERATION_SUCCESS, SUCCESS, teachers);
                })
                .doOnError(error -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            500, "Error retrieving teachers",
                            error.getMessage(), "-", null);
                });
    }
}