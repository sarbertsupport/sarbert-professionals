package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.albert.microservices.teaching.marketplace.configs.AppConfig;
import com.albert.microservices.teaching.marketplace.entities.ProfileStep;
import com.albert.microservices.teaching.marketplace.entities.StudentProfile;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.repositories.AdminUserContact;
import com.albert.microservices.teaching.marketplace.repositories.StudentProfileRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.StudentProfileService;
import com.albert.microservices.teaching.marketplace.utils.LoggerHelper;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class StudentProfileServiceImpl implements StudentProfileService {
    private static final Logger logger = LoggerFactory.getLogger(StudentProfileServiceImpl.class);
    private final Cloudinary cloudinary;
    private final AppConfig appConfig;
    private final StudentProfileRepository studentProfileRepository;
    private final LoggerHelper loggerHelper;
    private final UserRepository userRepository;

    public StudentProfileServiceImpl(Cloudinary cloudinary, AppConfig appConfig,
                                     StudentProfileRepository studentProfileRepository,
                                     LoggerHelper loggerHelper,
                                     UserRepository userRepository) {
        this.cloudinary = cloudinary;
        this.appConfig = appConfig;
        this.studentProfileRepository = studentProfileRepository;
        this.loggerHelper = loggerHelper;
        this.userRepository = userRepository;
    }

    @Override
    public Mono<ApiResponse> uploadImage(FilePart file) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "uploadImage";
        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", appConfig.getCloudName(),
                "api_key", appConfig.getApiKey(),
                "api_secret", appConfig.getApiSecret()));

        Flux<DataBuffer> dataBufferFlux = file.content();

        return DataBufferUtils.join(dataBufferFlux)
                .flatMap(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);

                    long fileSize = bytes.length;

                    if (fileSize > appConfig.getMaxFileSize()) {
                        long endTime = System.currentTimeMillis();
                        long duration = endTime - startTime;
                        LoggingUtility.logError(logger, transactionId, processName, duration,
                                400, "File size exceeds limit", "File size should be less than 240 KB", null, null);
                        return Mono.just(ApiResponse.createResponse(400, "Image file size should be less than 240 KB", "fail", null));
                    }

                    try {
                        Map<String, Object> uploadResult = cloudinary.uploader().upload(bytes,
                                ObjectUtils.asMap("folder", appConfig.getFolderName()));

                        String imageUrl = (String) uploadResult.get("url");
                        long endTime = System.currentTimeMillis();
                        long duration = endTime - startTime;
                        LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                CODE_SUCCESS, "Image uploaded successfully", null, "");
                        return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, "Image uploaded successfully", "success", imageUrl));
                    } catch (IOException e) {
                        long endTime = System.currentTimeMillis();
                        long duration = endTime - startTime;
                        LoggingUtility.logError(logger, transactionId, processName, duration,
                                500, "Error uploading image", e.getLocalizedMessage(), null, null);
                        return Mono.error(e);
                    }
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_VALIDATION, "Empty file", "Empty file received", null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Empty file", "fail", null));
                }));
    }

    @Override
    public Mono<ApiResponse> createStudentProfile(StudentProfile studentProfile) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "createStudentProfile";

        // 1. Validate required fields
        if (areRequiredFieldsEmpty(studentProfile)) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logError(logger, transactionId, processName, duration,
                    CODE_VALIDATION, "Validation failed", "All fields are required", studentProfile.toString(), null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "All fields are required",
                    BAD_REQUEST,
                    null));
        }

        // 2. Check phone duplication
        return studentProfileRepository.findByPhoneNumber(studentProfile.getPhoneNumber())
                .flatMap(existingProfile -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_CONFLICT, "Duplicate phone number", "Phone number already exists", studentProfile.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_CONFLICT,
                            "Phone number already exists",
                            CONFLICT,
                            null));
                })
                .switchIfEmpty(
                        // 3. Save profile
                        studentProfileRepository.save(studentProfile)
                                .flatMap(savedProfile -> {
                                    // 4. Update user step
                                    return userRepository.findById(savedProfile.getUserId())
                                            .flatMap(user -> {
                                                if (user.getCurrentStep() == ProfileStep.PROFILE) {
                                                    user.setCurrentStep(ProfileStep.COMPLETE);
                                                    return userRepository.save(user);
                                                }
                                                return Mono.just(user);
                                            })
                                            .thenReturn(ApiResponse.createResponse(
                                                    CODE_SUCCESS,
                                                    OPERATION_SUCCESS,
                                                    SUCCESS,
                                                    savedProfile));
                                })
                                .doOnSuccess(response -> {
                                    long duration = System.currentTimeMillis() - startTime;
                                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                            CODE_SUCCESS, "Profile created successfully", studentProfile.toString(), "");
                                })
                );
    }

    @Override
    public Mono<ApiResponse> updateStudentProfile(Integer userId, StudentProfile updatedProfile) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "updateStudentProfile";

        return studentProfileRepository.findByUserId(userId)
                .flatMap(existingProfile -> {
                    existingProfile.setFullName(updatedProfile.getFullName());
                    existingProfile.setGender(updatedProfile.getGender());
                    existingProfile.setBirthdate(updatedProfile.getBirthdate());
                    existingProfile.setLocation(updatedProfile.getLocation());
                    existingProfile.setPostalCode(updatedProfile.getPostalCode());
                    existingProfile.setPhoneNumber(updatedProfile.getPhoneNumber());
                    existingProfile.setBio(updatedProfile.getBio());
                    existingProfile.setImagePath(updatedProfile.getImagePath());
                    return studentProfileRepository.save(existingProfile);
                })
                .map(savedProfile -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                            CODE_SUCCESS, "Profile updated successfully", updatedProfile.toString(), "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            savedProfile);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, "Profile not found", "Student profile not found for user ID: " + userId, null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Student profile not found",
                            NOTFOUND,
                            null));
                }));
    }

    @Override
    public Mono<ApiResponse> getAllStudentProfiles(int page, int size, String fullName, String gender) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getAllStudentProfiles";

        // Adjust page number since we're using 0-based index for pagination
        int pageNumber = page > 0 ? page - 1 : 0;

        // Create publishers for count and find operations based on filters
        Mono<Long> countPublisher;
        Flux<StudentProfile> findPublisher;

        if ((fullName != null && !fullName.isEmpty()) || (gender != null && !gender.isEmpty())) {
            // Filter mode (either by name, gender, or both)
            countPublisher = studentProfileRepository.countByFilters(
                    fullName != null ? fullName : null,
                    gender != null ? gender : null
            );
            findPublisher = studentProfileRepository.findByFilters(
                    fullName != null ? fullName : null,
                    gender != null ? gender : null
            );
        } else {
            // Normal mode (get all)
            countPublisher = studentProfileRepository.count();
            findPublisher = studentProfileRepository.findAllByOrderByCreatedAtDesc();
        }

        return countPublisher
                .flatMap(total -> {
                    long totalPages = (long) Math.ceil((double) total / size);
                    // Adjust page number if it exceeds total pages
                    final int adjustedPage = (pageNumber >= totalPages && totalPages > 0)
                            ? (int) (totalPages - 1)
                            : pageNumber;

                    return findPublisher
                            .skip((long) adjustedPage * size)
                            .take(size)
                            .concatMap(profile -> {
                                if (profile.getUserId() == null) {
                                    return Mono.just(toAdminStudentRow(profile, null));
                                }
                                return userRepository.findAdminContactByUserId(profile.getUserId())
                                        .map(contact -> toAdminStudentRow(profile, contact))
                                        .switchIfEmpty(Mono.just(toAdminStudentRow(profile, null)));
                            })
                            .collectList()
                            .map(students -> {
                                Map<String, Object> response = new HashMap<>();
                                response.put("students", students);
                                response.put("currentPage", adjustedPage + 1); // Return 1-based page to client
                                response.put("totalItems", total);
                                response.put("totalPages", totalPages);

                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                        CODE_SUCCESS, "Retrieved student profiles",
                                        "page=" + page + ", size=" + size + ", fullName=" + fullName + ", gender=" + gender,
                                        "");
                                return ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        SUCCESS,
                                        response
                                );
                            });
                })
                .doOnError(error -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            500, "Error retrieving profiles", error.getMessage(),
                            "page=" + page + ", size=" + size + ", fullName=" + fullName + ", gender=" + gender,
                            null);
                });
    }

    @Override
    public Mono<ApiResponse> getStudentProfileById(Integer studentId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getStudentProfileById";

        return studentProfileRepository.findById(studentId)
                .flatMap(profile -> {
                    if (profile.getUserId() == null) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                CODE_SUCCESS, "Retrieved student profile", "studentId=" + studentId, "");
                        return Mono.just(ApiResponse.createResponse(
                                CODE_SUCCESS,
                                OPERATION_SUCCESS,
                                SUCCESS,
                                toAdminStudentRow(profile, null)));
                    }
                    return userRepository.findAdminContactByUserId(profile.getUserId())
                            .map(contact -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                        CODE_SUCCESS, "Retrieved student profile", "studentId=" + studentId, "");
                                return ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        SUCCESS,
                                        toAdminStudentRow(profile, contact));
                            })
                            .switchIfEmpty(Mono.fromCallable(() -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                        CODE_SUCCESS, "Retrieved student profile", "studentId=" + studentId, "");
                                return ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        SUCCESS,
                                        toAdminStudentRow(profile, null));
                            }));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, "Profile not found", "Student profile not found for ID: " + studentId, null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Student profile not found",
                            NOTFOUND,
                            null));
                }));
    }

    /** Profile fields plus account email/username for authenticated admin views. */
    private static Map<String, Object> toAdminStudentRow(StudentProfile p, AdminUserContact c) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", p.getId());
        row.put("userId", p.getUserId());
        row.put("fullName", p.getFullName());
        row.put("gender", p.getGender());
        row.put("birthdate", p.getBirthdate());
        row.put("location", p.getLocation());
        row.put("postalCode", p.getPostalCode());
        row.put("phoneNumber", p.getPhoneNumber());
        row.put("bio", p.getBio());
        row.put("imagePath", p.getImagePath());
        row.put("createdAt", p.getCreatedAt());
        row.put("updatedAt", p.getUpdatedAt());
        if (c != null) {
            String email = c.getEmail();
            row.put("email", email != null && !email.isBlank() ? email : null);
            String username = c.getUsername();
            row.put("username", username != null && !username.isBlank() ? username : null);
        } else {
            row.put("email", null);
            row.put("username", null);
        }
        return row;
    }

    @Override
    public Mono<ApiResponse> getStudentProfileByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getStudentProfileByUserId";

        return studentProfileRepository.findByUserId(userId)
                .map(profile -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                            CODE_SUCCESS, "Retrieved student profile", "userId=" + userId, "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            profile);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, "Profile not found", "Student profile not found for user ID: " + userId, null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Student profile not found",
                            NOTFOUND,
                            null));
                }));
    }

    private boolean areRequiredFieldsEmpty(StudentProfile studentProfile) {
        return studentProfile.getFullName() == null ||
                studentProfile.getGender() == null ||
                studentProfile.getBirthdate() == null ||
                studentProfile.getLocation() == null ||
                studentProfile.getPhoneNumber() == null ||
                studentProfile.getFullName().isEmpty() ||
                studentProfile.getGender().isEmpty() ||
                studentProfile.getLocation().isEmpty() ||
                studentProfile.getPhoneNumber().isEmpty();
    }
}