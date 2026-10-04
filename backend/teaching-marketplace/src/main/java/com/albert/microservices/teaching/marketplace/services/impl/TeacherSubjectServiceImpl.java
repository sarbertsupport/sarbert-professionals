package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.configs.AppConfig;
import com.albert.microservices.teaching.marketplace.entities.ProfileStep;
import com.albert.microservices.teaching.marketplace.entities.TeacherSubject;
import com.albert.microservices.teaching.marketplace.repositories.TeacherSubjectRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.requests.TeacherSubjectDTO;
import com.albert.microservices.teaching.marketplace.requests.TeacherSubjectSummaryDTO;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeacherSubjectService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class TeacherSubjectServiceImpl implements TeacherSubjectService {
    private static final Logger logger = LoggerFactory.getLogger(TeacherSubjectServiceImpl.class);
    private static final String SERVICE_NAME = "TeacherSubjectService";

    private final TeacherSubjectRepository teacherSubjectRepository;
    private final AppConfig appConfig;
    private final UserRepository userRepository;

    public TeacherSubjectServiceImpl(TeacherSubjectRepository teacherSubjectRepository, AppConfig appConfig, UserRepository userRepository) {
        this.teacherSubjectRepository = teacherSubjectRepository;
        this.appConfig = appConfig;
        this.userRepository = userRepository;
    }

    @Override
    public Mono<ApiResponse> createTeacherSubject(TeacherSubject teacherSubject) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "createTeacherSubject";
        long startTime = System.currentTimeMillis();

        if (teacherSubject == null) {
            LoggingUtility.logWarn(logger, transactionId, processName,
                    System.currentTimeMillis() - startTime,
                    CODE_VALIDATION,
                    "Teacher subject information is required",
                    "Null teacher subject provided",
                    null, null);

            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Teacher subject information is required",
                    BAD_REQUEST,
                    null));
        }

        return teacherSubjectRepository.countByTeacherId(teacherSubject.getTeacherId())
                .flatMap(count -> {
                    if (count >= appConfig.getMaxNumberOfSubjects()) {
                        LoggingUtility.logWarn(logger, transactionId, processName,
                                System.currentTimeMillis() - startTime,
                                CODE_VALIDATION,
                                "Maximum subjects limit reached",
                                "Teacher already has " + count + " subjects",
                                teacherSubject.toString(), null);

                        return Mono.just(ApiResponse.createResponse(
                                CODE_VALIDATION,
                                "The number of subjects cannot exceed " + appConfig.getMaxNumberOfSubjects(),
                                BAD_REQUEST,
                                null));
                    } else {
                        return teacherSubjectRepository.save(teacherSubject)
                                .flatMap(savedSubject ->
                                        userRepository.findById(teacherSubject.getUserId())
                                                .flatMap(user -> {
                                                    user.setCurrentStep(ProfileStep.DETAILS);
                                                    return userRepository.save(user);
                                                })
                                                .then(Mono.just(ApiResponse.createResponse(
                                                        CODE_SUCCESS,
                                                        OPERATION_SUCCESS,
                                                        SUCCESS,
                                                        null
                                                )))
                                )
                                .doOnSuccess(response -> {
                                    LoggingUtility.logInfo(logger, transactionId, processName,
                                            System.currentTimeMillis() - startTime,
                                            CODE_SUCCESS,
                                            "Teacher subject created successfully",
                                            teacherSubject.toString(), null);
                                });
                    }
                })
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to create teacher subject",
                            error.getMessage(),
                            teacherSubject.toString(), null);
                });
    }

    @Override
    public Mono<ApiResponse> updateTeacherSubject(Integer id, TeacherSubject teacherSubject) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "updateTeacherSubject";
        long startTime = System.currentTimeMillis();

        if (teacherSubject == null) {
            LoggingUtility.logWarn(logger, transactionId, processName,
                    System.currentTimeMillis() - startTime,
                    CODE_VALIDATION,
                    "Teacher subject information is required",
                    "Null teacher subject provided",
                    null, null);

            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Teacher subject information is required",
                    BAD_REQUEST,
                    null));
        }

        return teacherSubjectRepository.findById(id)
                .flatMap(existingTeacherSubject -> {
                    existingTeacherSubject.setTeacherId(teacherSubject.getTeacherId());
                    existingTeacherSubject.setSubjectId(teacherSubject.getSubjectId());

                    return teacherSubjectRepository.save(existingTeacherSubject)
                            .then(Mono.just(ApiResponse.createResponse(
                                    CODE_SUCCESS,
                                    OPERATION_SUCCESS,
                                    SUCCESS,
                                    null)))
                            .doOnSuccess(response -> {
                                LoggingUtility.logInfo(logger, transactionId, processName,
                                        System.currentTimeMillis() - startTime,
                                        CODE_SUCCESS,
                                        "Teacher subject updated successfully",
                                        teacherSubject.toString(), null);
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_NOT_FOUND,
                            "Teacher subject not found",
                            "Teacher subject with ID " + id + " not found",
                            teacherSubject != null ? teacherSubject.toString() : null, null);

                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Teacher subject not found",
                            NOTFOUND,
                            null));
                }))
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to update teacher subject",
                            error.getMessage(),
                            teacherSubject != null ? teacherSubject.toString() : null, null);
                });
    }

    @Override
    public Mono<ApiResponse> getTeacherSubjectsByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "getTeacherSubjectsByUserId";
        long startTime = System.currentTimeMillis();

        return teacherSubjectRepository.findSubjectsByUserId(userId)
                .collectList()
                .map(dtoList -> {
                    if (dtoList.isEmpty()) {
                        LoggingUtility.logWarn(logger, transactionId, processName,
                                System.currentTimeMillis() - startTime,
                                CODE_NOT_FOUND,
                                "No subjects found for user",
                                "No subjects found for user ID: " + userId,
                                null, null);

                        return ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "No subjects found for the given user ID",
                                NOTFOUND,
                                null
                        );
                    }

                    Integer teacherId = dtoList.get(0).getTeacherId();
                    List<String> subjects = dtoList.stream()
                            .map(TeacherSubjectDTO::getSubjectName)
                            .toList();

                    TeacherSubjectSummaryDTO responseDto = new TeacherSubjectSummaryDTO(userId, teacherId, subjects);

                    LoggingUtility.logInfo(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SUCCESS,
                            "Successfully retrieved teacher subjects",
                            "userId: " + userId, "");

                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            responseDto
                    );
                })
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to get teacher subjects",
                            error.getMessage(),
                            "userId: " + userId, null);
                });
    }
}