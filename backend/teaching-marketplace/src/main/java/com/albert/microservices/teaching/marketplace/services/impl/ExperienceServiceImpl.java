package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.Experience;
import com.albert.microservices.teaching.marketplace.entities.ProfileStep;
import com.albert.microservices.teaching.marketplace.repositories.ExperienceRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.requests.UpdateExperience;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.ExperienceService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class ExperienceServiceImpl implements ExperienceService {
    private static final Logger logger = LoggerFactory.getLogger(ExperienceServiceImpl.class);

    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;

    public ExperienceServiceImpl(ExperienceRepository experienceRepository, UserRepository userRepository) {
        this.experienceRepository = experienceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Mono<ApiResponse> createExperience(Experience experience) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = experience.toString();

        LoggingUtility.logInfo(logger, transactionId, "createExperience",
                null, 200, "Request received", requestPayload, null);

        // Validation
        if (isNullOrEmpty(experience.getOrganizationName())
                || isNullOrEmpty(experience.getDesignation())
                || experience.getStartDate() == null
                || isNullOrEmpty(experience.getAssociation())) {

            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "createExperience",
                    duration, CODE_VALIDATION, "Validation failed", "Missing required fields", requestPayload, null);

            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "All fields are required and endDate is not required for current job",
                    BAD_REQUEST,
                    null));
        }

        if (!experience.isCurrentJob() && experience.getEndDate() == null) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "createExperience",
                    duration, CODE_VALIDATION, "Validation failed", "End date required for past job", requestPayload, null);

            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "endDate is required for past job",
                    BAD_REQUEST,
                    null));
        }

        return experienceRepository.existsByTeacherIdAndOrganizationNameAndDesignationAndStartDateAndEndDate(
                experience.getTeacherId(),
                experience.getOrganizationName(),
                experience.getDesignation(),
                experience.getStartDate(),
                experience.getEndDate())
                .flatMap(exists -> {
                    if (exists) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "createExperience",
                                duration, CODE_CONFLICT, "Duplicate experience found",
                                "Experience record already exists", requestPayload, null);

                        return Mono.just(ApiResponse.createResponse(
                                CODE_CONFLICT,
                                "Duplicate experience record found",
                                CONFLICT,
                                null));
                    } else {
                        return experienceRepository.save(experience)
                                .doOnNext(saved -> {
                                    long duration = System.currentTimeMillis() - startTime;
                                    LoggingUtility.logInfo(logger, transactionId, "createExperience",
                                            duration, 200, "Experience saved successfully", null, "");
                                })
                                .flatMap(savedExperience ->
                                        userRepository.findById(experience.getUserId())
                                                .flatMap(user -> {
                                                    if (ProfileStep.EXPERIENCE.equals(user.getCurrentStep())) {
                                                        user.setCurrentStep(ProfileStep.SUBJECTS);
                                                        return userRepository.save(user)
                                                                .doOnNext(updatedUser -> {
                                                                    LoggingUtility.logInfo(logger, transactionId, "createExperience",
                                                                            null, 200,
                                                                            "User profile step updated to SUBJECTS",
                                                                            null, "");
                                                                });
                                                    }
                                                    return Mono.just(user);
                                                })
                                                .thenReturn(ApiResponse.createResponse(
                                                        CODE_SUCCESS,
                                                        OPERATION_SUCCESS,
                                                        SUCCESS,
                                                        savedExperience
                                                ))
                                );
                    }
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "createExperience",
                            duration, 500, "Error creating experience",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error creating experience record",
                            SERVER_ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> updateExperience(Integer experienceId, Integer userId, UpdateExperience updatedExperience) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("experienceId=%d, userId=%d, experience=%s",
                experienceId, userId, updatedExperience.toString());

        LoggingUtility.logInfo(logger, transactionId, "updateExperience",
                null, 200, "Request received", requestPayload, null);

        return experienceRepository.findByExperienceIdAndUserId(experienceId, userId)
                .flatMap(existingExperience -> {
                    existingExperience.setOrganizationName(updatedExperience.getOrganizationName());
                    existingExperience.setDesignation(updatedExperience.getDesignation());
                    existingExperience.setStartDate(updatedExperience.getStartDate());
                    existingExperience.setEndDate(updatedExperience.getEndDate());
                    existingExperience.setAssociation(updatedExperience.getAssociation());
                    existingExperience.setJobDescription(updatedExperience.getJobDescription());
                    existingExperience.setCurrentJob(updatedExperience.isCurrentJob());

                    return experienceRepository.save(existingExperience)
                            .doOnNext(saved -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "updateExperience",
                                        duration, 200, "Experience updated successfully", null, "");
                            })
                            .map(savedExperience -> ApiResponse.createResponse(
                                    CODE_SUCCESS,
                                    OPERATION_SUCCESS,
                                    SUCCESS,
                                    savedExperience));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "updateExperience",
                            duration, CODE_NOT_FOUND, "Experience not found",
                            String.format("No experience found for experienceId=%d, userId=%d", experienceId, userId),
                            requestPayload, null);

                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Experience record not found",
                            NOTFOUND,
                            null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "updateExperience",
                            duration, 500, "Error updating experience",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error updating experience record",
                            SERVER_ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> getAllExperiences() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getAllExperiences",
                null, 200, "Request received", null, null);

        return experienceRepository.findAll()
                .collectList()
                .map(experiences -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getAllExperiences",
                            duration, CODE_SUCCESS, "Retrieved all experiences",
                            null, "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            experiences);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getAllExperiences",
                            duration, 500, "Error retrieving experiences",
                            e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error retrieving experience records",
                            SERVER_ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> getExperiencesByTeacherId(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "teacherId=" + teacherId;

        LoggingUtility.logInfo(logger, transactionId, "getExperiencesByTeacherId",
                null, 200, "Request received", requestPayload, null);

        return experienceRepository.findByTeacherId(teacherId)
                .collectList()
                .flatMap(experiences -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (!experiences.isEmpty()) {
                        LoggingUtility.logInfo(logger, transactionId, "getExperiencesByTeacherId",
                                duration, CODE_SUCCESS, "Experiences retrieved",
                                null, "");
                        return Mono.just(ApiResponse.createResponse(
                                CODE_SUCCESS,
                                OPERATION_SUCCESS,
                                SUCCESS,
                                experiences));
                    } else {
                        LoggingUtility.logWarn(logger, transactionId, "getExperiencesByTeacherId",
                                duration, CODE_NOT_FOUND, "No experiences found",
                                "No experiences for teacherId: " + teacherId, requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "Experiences not found for teacher ID: " + teacherId,
                                NOTFOUND,
                                null));
                    }
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getExperiencesByTeacherId",
                            duration, 500, "Error retrieving experiences",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error retrieving experience records",
                            SERVER_ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> getExperiencesByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        LoggingUtility.logInfo(logger, transactionId, "getExperiencesByUserId",
                null, 200, "Request received", requestPayload, null);

        return experienceRepository.findByUserId(userId)
                .collectList()
                .flatMap(experiences -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (!experiences.isEmpty()) {
                        LoggingUtility.logInfo(logger, transactionId, "getExperiencesByUserId",
                                duration, CODE_SUCCESS, "Experiences retrieved",
                                null, "");
                        return Mono.just(ApiResponse.createResponse(
                                CODE_SUCCESS,
                                OPERATION_SUCCESS,
                                SUCCESS,
                                experiences));
                    } else {
                        LoggingUtility.logWarn(logger, transactionId, "getExperiencesByUserId",
                                duration, CODE_NOT_FOUND, "No experiences found",
                                "No experiences for userId: " + userId, requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "Experiences not found for user ID: " + userId,
                                NOTFOUND,
                                null));
                    }
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getExperiencesByUserId",
                            duration, 500, "Error retrieving experiences",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error retrieving experience records",
                            SERVER_ERROR,
                            null));
                });
    }

    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}