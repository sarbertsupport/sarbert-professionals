package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.Education;
import com.albert.microservices.teaching.marketplace.entities.ProfileStep;
import com.albert.microservices.teaching.marketplace.repositories.EducationRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.requests.UpdateEducation;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.EducationService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class EducationServiceImpl implements EducationService {
    private final EducationRepository educationRepository;
    private final UserRepository userRepository;
    private final Logger logger = LoggerFactory.getLogger(EducationServiceImpl.class);

    public EducationServiceImpl(EducationRepository educationRepository, UserRepository userRepository) {
        this.educationRepository = educationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Mono<ApiResponse> createEducation(Education education) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = education.toString();

        LoggingUtility.logInfo(logger, transactionId, "createEducation",
                null, 200, "Request received", requestPayload, null);

        // Validation
        if (isNullOrEmpty(education.getInstitutionName())
                || isNullOrEmpty(education.getDegreeType())
                || isNullOrEmpty(education.getDegreeName())
                || education.getStartDate() == null
                || education.getEndDate() == null
                || isNullOrEmpty(education.getAssociation())
                || isNullOrEmpty(education.getSpecialization())) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "createEducation",
                    duration, CODE_VALIDATION, "Validation failed", "Missing required fields", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "All fields are required",
                    BAD_REQUEST,
                    null));
        }

        // Check for duplicate
        return educationRepository.findByTeacherIdAndDegreeTypeAndDegreeName(
                education.getTeacherId(), education.getDegreeType(), education.getDegreeName())
                .flatMap(existingEducation -> {

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "createEducation",
                            duration, CODE_CONFLICT, "Duplicate education found",
                            String.format("Duplicate for teacherId=%d, degreeType=%s, degreeName=%s",
                                    education.getTeacherId(), education.getDegreeType(), ""),
                            requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_CONFLICT,
                            "Duplicate education record found",
                            CONFLICT,
                            null));
                })
                .switchIfEmpty(
                        educationRepository.save(education)
                                .doOnNext(saved -> {
                                    long duration = System.currentTimeMillis() - startTime;
                                    LoggingUtility.logInfo(logger, transactionId, "createEducation",
                                            duration, 200, "Education saved successfully", null, "");
                                })
                                .flatMap(savedEducation ->
                                        userRepository.findById(education.getUserId())
                                                .flatMap(user -> {
                                                    LoggingUtility.logInfo(logger, transactionId, "createEducation",
                                                            null, 200,
                                                            String.format("Fetched user ID: %d, current step: %s",
                                                                    user.getUserId(), user.getCurrentStep()),
                                                            null, null);

                                                    if (ProfileStep.EDUCATION.equals(user.getCurrentStep())) {
                                                        user.setCurrentStep(ProfileStep.EXPERIENCE);
                                                        return userRepository.save(user)
                                                                .doOnNext(updatedUser -> {
                                                                    long duration = System.currentTimeMillis() - startTime;
                                                                    LoggingUtility.logInfo(logger, transactionId, "createEducation",
                                                                            duration, 200,
                                                                            String.format("User step updated to %s",
                                                                                    updatedUser.getCurrentStep()),
                                                                            null, "");
                                                                })
                                                                .thenReturn(ApiResponse.createResponse(
                                                                        CODE_SUCCESS,
                                                                        OPERATION_SUCCESS,
                                                                        SUCCESS,
                                                                        savedEducation
                                                                ));
                                                    } else {
                                                        long duration = System.currentTimeMillis() - startTime;
                                                        LoggingUtility.logInfo(logger, transactionId, "createEducation",
                                                                duration, 200,
                                                                "User step not EDUCATION, no update needed",
                                                                null, "");
                                                        return Mono.just(ApiResponse.createResponse(
                                                                CODE_SUCCESS,
                                                                OPERATION_SUCCESS,
                                                                SUCCESS,
                                                                savedEducation
                                                        ));
                                                    }
                                                })
                                )
                )
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "createEducation",
                            duration, 500, "Error creating education",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error creating education record",
                            SERVER_ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> updateEducation(Integer educationId, Integer userId, UpdateEducation updatedEducation) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("educationId=%d, userId=%d, education=%s",
                educationId, userId, updatedEducation.toString());

        LoggingUtility.logInfo(logger, transactionId, "updateEducation",
                null, 200, "Request received", requestPayload, null);

        return educationRepository.findByEducationIdAndUserId(educationId, userId)
                .flatMap(existingEducation -> {
                    existingEducation.setInstitutionName(updatedEducation.getInstitutionName());
                    existingEducation.setDegreeType(updatedEducation.getDegreeType());
                    existingEducation.setDegreeName(updatedEducation.getDegreeName());
                    existingEducation.setStartDate(updatedEducation.getStartDate());
                    existingEducation.setEndDate(updatedEducation.getEndDate());
                    existingEducation.setAssociation(updatedEducation.getAssociation());
                    existingEducation.setSpecialization(updatedEducation.getSpecialization());
                    existingEducation.setScore(updatedEducation.getScore());

                    return educationRepository.save(existingEducation)
                            .doOnNext(saved -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "updateEducation",
                                        duration, 200, "Education updated successfully", null, "");
                            });
                })
                .map(savedEducation -> ApiResponse.createResponse(
                        CODE_SUCCESS,
                        "Education record updated successfully",
                        SUCCESS,
                        savedEducation))
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "updateEducation",
                            duration, CODE_NOT_FOUND, "Education not found or access denied",
                            String.format("No education found for educationId=%d, userId=%d", educationId, userId),
                            requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Education record not found or access denied",
                            NOTFOUND,
                            null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "updateEducation",
                            duration, 500, "Error updating education",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error updating education record",
                            SERVER,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> getEducationByTeacherId(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "teacherId=" + teacherId;

        LoggingUtility.logInfo(logger, transactionId, "getEducationByTeacherId",
                null, 200, "Request received", requestPayload, null);

        return educationRepository.findByTeacherId(teacherId)
                .collectList()
                .flatMap(educations -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (educations.isEmpty()) {
                        LoggingUtility.logWarn(logger, transactionId, "getEducationByTeacherId",
                                duration, CODE_NOT_FOUND, "No education records found",
                                String.format("No education found for teacherId=%d", teacherId),
                                requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "No education records found",
                                NOTFOUND,
                                null));
                    } else {
                        LoggingUtility.logInfo(logger, transactionId, "getEducationByTeacherId",
                                duration, CODE_SUCCESS, "Education records retrieved",
                                null, "");
                        return Mono.just(ApiResponse.createResponse(
                                CODE_SUCCESS,
                                OPERATION_SUCCESS,
                                SUCCESS,
                                educations));
                    }
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getEducationByTeacherId",
                            duration, 500, "Error retrieving education",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error retrieving education records",
                            SERVER_ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> getEducationByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        LoggingUtility.logInfo(logger, transactionId, "getEducationByUserId",
                null, 200, "Request received", requestPayload, null);

        return educationRepository.findByUserId(userId)
                .collectList()
                .flatMap(educations -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (educations.isEmpty()) {
                        LoggingUtility.logWarn(logger, transactionId, "getEducationByUserId",
                                duration, CODE_NOT_FOUND, "No education records found",
                                String.format("No education found for userId=%d", userId),
                                requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "No education records found",
                                NOTFOUND,
                                null));
                    } else {
                        LoggingUtility.logInfo(logger, transactionId, "getEducationByUserId",
                                duration, CODE_SUCCESS, "Education records retrieved",
                                null, "");
                        return Mono.just(ApiResponse.createResponse(
                                CODE_SUCCESS,
                                OPERATION_SUCCESS,
                                SUCCESS,
                                educations));
                    }
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getEducationByUserId",
                            duration, 500, "Error retrieving education",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error retrieving education records",
                            SERVER_ERROR,
                            null));
                });
    }

    @Override
    public Mono<ApiResponse> getAllEducations() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getAllEducations",
                null, 200, "Request received", null, null);

        return educationRepository.findAll()
                .collectList()
                .map(educations -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getAllEducations",
                            duration, CODE_SUCCESS, "All education records retrieved",
                            null, "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            educations);
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getAllEducations",
                            duration, 500, "Error retrieving all educations",
                            e.getMessage(), null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error retrieving all education records",
                            SERVER_ERROR,
                            null));
                });
    }

    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}