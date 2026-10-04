package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.ProfileStep;
import com.albert.microservices.teaching.marketplace.entities.TeachingDetail;
import com.albert.microservices.teaching.marketplace.repositories.TeacherProfileRepository;
import com.albert.microservices.teaching.marketplace.repositories.TeachingDetailRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.requests.UpdateTeachingDetails;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeachingDetailService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;
import java.util.stream.Collectors;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class TeachingDetailServiceImpl implements TeachingDetailService {
    private static final Logger logger = LoggerFactory.getLogger(TeachingDetailServiceImpl.class);
    private static final String SERVICE_NAME = "TeachingDetailService";

    private final TeachingDetailRepository teachingDetailRepository;
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    public TeachingDetailServiceImpl(TeachingDetailRepository teachingDetailRepository,
                                     UserRepository userRepository,
                                     TeacherProfileRepository teacherProfileRepository) {
        this.teachingDetailRepository = teachingDetailRepository;
        this.userRepository = userRepository;
        this.teacherProfileRepository = teacherProfileRepository;
    }

    @Override
    public Mono<ApiResponse> createTeachingDetail(TeachingDetail teachingDetail) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "createTeachingDetail";
        long startTime = System.currentTimeMillis();

        // Validate the input
        ApiResponse validationResponse = validateTeachingDetail(teachingDetail);
        if (validationResponse != null) {
            LoggingUtility.logWarn(logger, transactionId, processName,
                    System.currentTimeMillis() - startTime,
                    CODE_VALIDATION,
                    "Validation failed for teaching detail",
                    "Missing required fields",
                    teachingDetail != null ? teachingDetail.toString() : null,
                    null);

            return Mono.just(validationResponse);
        }

        // Check if teaching detail already exists for the teacher
        return teachingDetailRepository.findByTeacherId(teachingDetail.getTeacherId())
                .flatMap(existingTeachingDetail -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_CONFLICT,
                            "Teaching detail already exists",
                            "Teacher ID: " + teachingDetail.getTeacherId(),
                            teachingDetail.toString(),
                            null);

                    return Mono.just(ApiResponse.createResponse(
                            CODE_CONFLICT,
                            "Teaching detail already exists",
                            CONFLICT,
                            null));
                })
                .switchIfEmpty(
                        teachingDetailRepository.save(teachingDetail)
                                .flatMap(savedTeachingDetail ->
                                        Mono.zip(
                                                // Update user profile step to COMPLETE
                                                userRepository.findById(teachingDetail.getUserId())
                                                        .flatMap(user -> {
                                                            user.setCurrentStep(ProfileStep.COMPLETE);
                                                            return userRepository.save(user);
                                                        }),
                                                // Update teacher profile to show_clients = true
                                                teacherProfileRepository.findByTeacherId(teachingDetail.getTeacherId())
                                                        .flatMap(teacherProfile -> {
                                                            teacherProfile.setShowClients(true);
                                                            return teacherProfileRepository.save(teacherProfile);
                                                        })
                                        )
                                                .then(Mono.just(ApiResponse.createResponse(
                                                        CODE_SUCCESS,
                                                        OPERATION_SUCCESS,
                                                        SUCCESS,
                                                        savedTeachingDetail
                                                )))
                                                .doOnSuccess(response -> {
                                                    LoggingUtility.logInfo(logger, transactionId, processName,
                                                            System.currentTimeMillis() - startTime,
                                                            CODE_SUCCESS,
                                                            "Teaching detail created and profile made visible to clients",
                                                            teachingDetail.toString(),
                                                            "");
                                                })
                                )
                )
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to create teaching detail",
                            error.getMessage(),
                            teachingDetail.toString(),
                            null);
                });
    }

    private ApiResponse validateTeachingDetail(TeachingDetail teachingDetail) {
        if (teachingDetail == null ||
                isNullOrEmpty(teachingDetail.getRate()) ||
                teachingDetail.getMaxFee() == null ||
                teachingDetail.getMinFee() == null ||
                isNullOrEmpty(teachingDetail.getPaymentDetails()) ||
                teachingDetail.getTotalExpYears() == null ||
                teachingDetail.getOnlineExpYears() == null ||
                teachingDetail.getTravelWillingness() == null ||
                teachingDetail.getOnlineAvailability() == null ||
                teachingDetail.getHomeworkHelp() == null ||
                teachingDetail.getCurrentlyEmployed() == null ||
                isNullOrEmpty(teachingDetail.getWorkPreference())) {

            return ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "All fields are required",
                    BAD_REQUEST,
                    null);
        }
        return null;
    }
    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    @Override
    public Mono<ApiResponse> updateTeachingDetail(Integer id, Integer userId, UpdateTeachingDetails updatedTeachingDetail) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "updateTeachingDetail";
        long startTime = System.currentTimeMillis();

        return teachingDetailRepository.findByTeacherIdAndUserId(id, userId)
                .flatMap(existingTeachingDetail -> {
                    existingTeachingDetail.setRate(updatedTeachingDetail.getRate());
                    existingTeachingDetail.setMaxFee(updatedTeachingDetail.getMaxFee());
                    existingTeachingDetail.setMinFee(updatedTeachingDetail.getMinFee());
                    existingTeachingDetail.setHomeAvailability(updatedTeachingDetail.getHomeAvailability());
                    existingTeachingDetail.setMinFee(updatedTeachingDetail.getMinFee());
                    existingTeachingDetail.setPaymentDetails(updatedTeachingDetail.getPaymentDetails());
                    existingTeachingDetail.setTotalExpYears(updatedTeachingDetail.getTotalExpYears());
                    existingTeachingDetail.setOnlineExpYears(updatedTeachingDetail.getOnlineExpYears());
                    existingTeachingDetail.setTravelWillingness(updatedTeachingDetail.getTravelWillingness());
                    existingTeachingDetail.setTravelDistance(updatedTeachingDetail.getTravelDistance());
                    existingTeachingDetail.setOnlineAvailability(updatedTeachingDetail.getOnlineAvailability());
                    existingTeachingDetail.setHomeworkHelp(updatedTeachingDetail.getHomeworkHelp());
                    existingTeachingDetail.setCurrentlyEmployed(updatedTeachingDetail.getCurrentlyEmployed());
                    existingTeachingDetail.setWorkPreference(updatedTeachingDetail.getWorkPreference());

                    return teachingDetailRepository.save(existingTeachingDetail)
                            .map(savedTeachingDetail -> ApiResponse.createResponse(
                                    CODE_SUCCESS,
                                    OPERATION_SUCCESS,
                                    SUCCESS,
                                    savedTeachingDetail))
                            .doOnSuccess(response -> {
                                LoggingUtility.logInfo(logger, transactionId, processName,
                                        System.currentTimeMillis() - startTime,
                                        CODE_SUCCESS,
                                        "Teaching detail updated successfully",
                                        updatedTeachingDetail.toString(),
                                        "");
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_NOT_FOUND,
                            "Teaching detail not found",
                            "Teaching detail with ID: " + id + " and user ID: " + userId + " not found",
                            updatedTeachingDetail != null ? updatedTeachingDetail.toString() : null,
                            null);

                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Teaching detail not found",
                            NOTFOUND,
                            null));
                }))
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to update teaching detail",
                            error.getMessage(),
                            updatedTeachingDetail != null ? updatedTeachingDetail.toString() : null,
                            null);
                });
    }

    @Override
    public Mono<ApiResponse> getAllTeachingDetails() {
        String transactionId = UUID.randomUUID().toString();
        String processName = "getAllTeachingDetails";
        long startTime = System.currentTimeMillis();

        return teachingDetailRepository.findAll()
                .collect(Collectors.toList())
                .flatMap(res -> {
                    LoggingUtility.logInfo(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SUCCESS,
                            "Retrieved all teaching details",
                            null,
                            "");

                    return Mono.just(ApiResponse.createResponse(CODE_SUCCESS,
                            OPERATION_SUCCESS, SUCCESS, res));
                })
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to get all teaching details",
                            error.getMessage(),
                            null,
                            null);
                });
    }

    @Override
    public Mono<ApiResponse> getTeachingDetailByTeacherId(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "getTeachingDetailByTeacherId";
        long startTime = System.currentTimeMillis();

        return teachingDetailRepository.findByTeacherId(teacherId)
                .flatMap(teachingDetails -> {
                    LoggingUtility.logInfo(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SUCCESS,
                            "Retrieved teaching detail by teacher ID",
                            "teacherId: " + teacherId,
                            "");

                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            teachingDetails));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_NOT_FOUND,
                            "Teaching detail not found",
                            "No teaching detail found for teacher ID: " + teacherId,
                            null,
                            null);

                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "No teaching detail found for teacher ID: " + teacherId,
                            NOTFOUND,
                            null));
                }))
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to get teaching detail by teacher ID",
                            error.getMessage(),
                            "teacherId: " + teacherId,
                            null);
                });
    }

    @Override
    public Mono<ApiResponse> getTeachingDetailByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        String processName = "getTeachingDetailByUserId";
        long startTime = System.currentTimeMillis();

        return teachingDetailRepository.findByUserId(userId)
                .flatMap(teachingDetails -> {
                    LoggingUtility.logInfo(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SUCCESS,
                            "Retrieved teaching detail by user ID",
                            "userId: " + userId,
                            "");

                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            teachingDetails));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_NOT_FOUND,
                            "Teaching detail not found",
                            "No teaching detail found for user ID: " + userId,
                            null,
                            null);

                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "No teaching detail found for teacher ID: " + userId,
                            NOTFOUND,
                            null));
                }))
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            CODE_SERVER_ERROR,
                            "Failed to get teaching detail by user ID",
                            error.getMessage(),
                            "userId: " + userId,
                            null);
                });
    }
}