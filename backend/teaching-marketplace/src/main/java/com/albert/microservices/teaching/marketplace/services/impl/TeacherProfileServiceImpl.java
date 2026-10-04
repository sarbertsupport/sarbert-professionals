package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.configs.AppConfig;
import com.albert.microservices.teaching.marketplace.entities.ProfileStep;
import com.albert.microservices.teaching.marketplace.entities.TeacherProfile;
import com.albert.microservices.teaching.marketplace.entities.TeachingDetail;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.repositories.AdminUserContact;
import com.albert.microservices.teaching.marketplace.repositories.TeacherProfileInfoRepository;
import com.albert.microservices.teaching.marketplace.repositories.TeacherProfileRepository;
import com.albert.microservices.teaching.marketplace.repositories.TeachingDetailRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.requests.UpdateTeacherProfile;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeacherProfileService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class TeacherProfileServiceImpl implements TeacherProfileService {
    private static final Logger logger = LoggerFactory.getLogger(TeacherProfileServiceImpl.class);
    private final Cloudinary cloudinary;
    private final AppConfig appConfig;
    private final TeacherProfileRepository teacherProfileRepository;
    private final UserRepository userRepository;
    private final TeacherProfileInfoRepository teacherProfileInfoRepository;
    private final TeachingDetailRepository teachingDetailRepository;

    public TeacherProfileServiceImpl(Cloudinary cloudinary, AppConfig appConfig,
                                     TeacherProfileRepository teacherProfileRepository, UserRepository userRepository,
                                     TeacherProfileInfoRepository teacherProfileInfoRepository,
                                     TeachingDetailRepository teachingDetailRepository) {
        this.cloudinary = cloudinary;
        this.appConfig = appConfig;
        this.teacherProfileRepository = teacherProfileRepository;
        this.userRepository = userRepository;
        this.teacherProfileInfoRepository = teacherProfileInfoRepository;
        this.teachingDetailRepository = teachingDetailRepository;
    }

    @Override
    public Mono<ApiResponse> uploadImage(FilePart file) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
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
                        LoggingUtility.logError(logger, transactionId, "uploadImage",
                                endTime - startTime, 400, "File size exceeds limit",
                                "File size should be less than " + appConfig.getMaxFileSize(),
                                "File size: " + fileSize, null);
                        return Mono.just(ApiResponse.createResponse(400, "Image file size should be less than 240 KB", "fail", null));
                    }

                    try {
                        Map<String, Object> uploadResult = cloudinary.uploader().upload(bytes,
                                ObjectUtils.asMap("folder", appConfig.getFolderName()));

                        String imageUrl = (String) uploadResult.get("url");
                        long endTime = System.currentTimeMillis();
                        LoggingUtility.logInfo(logger, transactionId, "uploadImage",
                                endTime - startTime, CODE_SUCCESS, "Image uploaded successfully",
                                null, "");
                        return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, "Image uploaded successfully", "success", imageUrl));
                    } catch (IOException e) {
                        long endTime = System.currentTimeMillis();
                        LoggingUtility.logError(logger, transactionId, "uploadImage",
                                endTime - startTime, 500, "Image upload failed",
                                e.getLocalizedMessage(), null, null);
                        return Mono.error(e);
                    }
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logError(logger, transactionId, "uploadImage",
                            System.currentTimeMillis() - startTime, CODE_VALIDATION,
                            "Empty file received", "Empty file", null, null);
                    return Mono.just(ApiResponse.createResponse(CODE_VALIDATION, "Empty file", "fail", null));
                }));
    }

    @Override
    public Mono<ApiResponse> createTeacherProfile(TeacherProfile teacherProfile) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        boolean isCompany = teacherProfile.isCompany();

        // 1. Validate required fields
        if (isCompany ? isCompanyFieldsEmpty(teacherProfile) : isIndividualFieldsEmpty(teacherProfile)) {
            LoggingUtility.logWarn(logger, transactionId, "createTeacherProfile",
                    System.currentTimeMillis() - startTime, CODE_VALIDATION,
                    "Validation failed - missing required fields",
                    "All fields are required", teacherProfile.toString(), null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "All fields are required",
                    BAD_REQUEST,
                    null));
        }

        // 2. Check phone duplication
        return teacherProfileRepository.findByPhoneNumber(teacherProfile.getPhoneNumber())
                .flatMap(existingTeacherProfile -> {
                    LoggingUtility.logWarn(logger, transactionId, "createTeacherProfile",
                            System.currentTimeMillis() - startTime, CODE_CONFLICT,
                            "Phone number already exists",
                            "Duplicate phone number: " + teacherProfile.getPhoneNumber(),
                            teacherProfile.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_CONFLICT,
                            "Phone number already exists",
                            CONFLICT,
                            null));
                })
                .switchIfEmpty(
                        // 3. Save profile
                        teacherProfileRepository.save(teacherProfile)
                                .flatMap(savedTeacherProfile -> {
                                    // 4. Update user step
                                    return userRepository.findById(savedTeacherProfile.getUserId())
                                            .flatMap(user -> {
                                                if (user.getCurrentStep() == ProfileStep.PROFILE) {
                                                    user.setCurrentStep(ProfileStep.EDUCATION);
                                                    return userRepository.save(user);
                                                }
                                                return Mono.just(user);
                                            })
                                            .then(Mono.defer(() -> {
                                                LoggingUtility.logInfo(logger, transactionId, "createTeacherProfile",
                                                        System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                                        "Teacher profile created successfully",
                                                        null, "");
                                                return Mono.just(ApiResponse.createResponse(
                                                        CODE_SUCCESS,
                                                        OPERATION_SUCCESS,
                                                        SUCCESS,
                                                        savedTeacherProfile));
                                            }));
                                })
                );
    }

    @Override
    public Mono<ApiResponse> updateTeacherProfile(Integer userId, UpdateTeacherProfile updatedProfile) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        return teacherProfileRepository.getUserProfile(userId)
                .flatMap(existingProfile -> {
                    existingProfile.setBirthdate(updatedProfile.getBirthdate());
                    existingProfile.setLocation(updatedProfile.getLocation());
                    existingProfile.setPostalCode(updatedProfile.getPostalCode());
                    existingProfile.setPhoneNumber(updatedProfile.getPhoneNumber());
                    existingProfile.setProfileDescription(updatedProfile.getProfileDescription());
                    return teacherProfileRepository.save(existingProfile)
                            .doOnSuccess(savedProfile -> {
                                LoggingUtility.logInfo(logger, transactionId, "updateTeacherProfile",
                                        System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                        "Teacher profile updated successfully",
                                        null, "");
                            });
                })
                .map(savedProfile -> ApiResponse.createResponse(
                        CODE_SUCCESS,
                        OPERATION_SUCCESS,
                        SUCCESS,
                        savedProfile))
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "updateTeacherProfile",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "Teacher profile not found",
                            "User ID: " + userId, updatedProfile.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Teacher profile not found",
                            NOTFOUND,
                            null));
                }));
    }

    @Override
    public Mono<ApiResponse> getAllTeacherProfiles() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        return teacherProfileRepository.findAll()
                .collectList()
                .map(teacherProfiles -> {
                    teacherProfiles.forEach(profile -> {
                        if (profile.getDisplayName() != null && profile.getDisplayName().contains(" ")) {
                            String firstName = profile.getDisplayName().split(" ")[0];
                            profile.setDisplayName(firstName);
                        }
                    });
                    LoggingUtility.logInfo(logger, transactionId, "getAllTeacherProfiles",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            "Retrieved all teacher profiles",
                            null, "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            teacherProfiles);
                })
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, "getAllTeacherProfiles",
                            System.currentTimeMillis() - startTime, 500,
                            "Failed to retrieve teacher profiles",
                            error.getMessage(), null, null);
                });
    }

    @Override
    public Mono<ApiResponse> getTeacherProfileById(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        return teacherProfileRepository.findByTeacherId(teacherId)
                .map(profile -> {
                    if (profile.getDisplayName() != null && profile.getDisplayName().contains(" ")) {
                        String firstName = profile.getDisplayName().split(" ")[0];
                        profile.setDisplayName(firstName);
                    }
                    LoggingUtility.logInfo(logger, transactionId, "getTeacherProfileById",
                            System.currentTimeMillis() - startTime, CODE_SUCCESS,
                            "Retrieved teacher profile",
                            null, "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            profile);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "getTeacherProfileById",
                            System.currentTimeMillis() - startTime, CODE_NOT_FOUND,
                            "Teacher profile not found",
                            "Teacher ID: " + teacherId, null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Teacher profile not found",
                            NOTFOUND,
                            null));
                })
                        .doOnError(error -> {
                            LoggingUtility.logError(logger, transactionId, "getTeacherProfileById",
                                    System.currentTimeMillis() - startTime, 500,
                                    "Failed to retrieve teacher profile",
                                    error.getMessage(), "Teacher ID: " + teacherId, null);
                        }));
    }

    @Override
    public Mono<ApiResponse> getAllPaginatedTeachers(int page, int size, String displayName) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Adjust page number since repository uses 0-based index
        int pageNumber = page > 0 ? page - 1 : 0;

        // Create publishers for count and find operations
        Mono<Long> countPublisher;
        Flux<TeacherProfile> findPublisher;

        if (displayName != null && !displayName.isEmpty()) {
            // Search mode
            countPublisher = teacherProfileRepository.countByDisplayNameContainingIgnoreCase(displayName);
            findPublisher = teacherProfileRepository.findByDisplayNameContainingIgnoreCase(displayName);
            LoggingUtility.logInfo(logger, transactionId, "getAllPaginatedTeachers",
                    null, CODE_SUCCESS, "Searching teachers by name",
                    "Display name: " + displayName, null);
        } else {
            // Normal mode (get all)
            countPublisher = teacherProfileRepository.count();
            findPublisher = teacherProfileRepository.findAll();
            LoggingUtility.logInfo(logger, transactionId, "getAllPaginatedTeachers",
                    null, CODE_SUCCESS, "Getting all paginated teachers",
                    null, null);
        }

        return countPublisher
                .flatMap(total -> {
                    long totalPages = (long) Math.ceil((double) total / size);
                    final int adjustedPage = (pageNumber >= totalPages && totalPages > 0)
                            ? (int) (totalPages - 1)
                            : pageNumber;

                    return findPublisher
                            .skip((long) adjustedPage * size)
                            .take(size)
                            .concatMap(profile -> {
                                Mono<Optional<AdminUserContact>> contactMono = profile.getUserId() == null
                                        ? Mono.just(Optional.empty())
                                        : userRepository.findAdminContactByUserId(profile.getUserId())
                                                .map(Optional::of)
                                                .defaultIfEmpty(Optional.empty());
                                return Mono.zip(
                                        Mono.just(profile),
                                        contactMono,
                                        teachingDetailRepository.findByTeacherId(profile.getTeacherId())
                                                .defaultIfEmpty(new TeachingDetail())
                                ).map(t -> {
                                    TeacherProfile p = t.getT1();
                                    AdminUserContact u = t.getT2().orElse(null);
                                    TeachingDetail td = t.getT3();
                                    Map<String, Object> row = new HashMap<>();
                                    row.put("teacherId", p.getTeacherId());
                                    row.put("userId", p.getUserId());
                                    row.put("displayName", p.getDisplayName());
                                    String email = u != null ? u.getEmail() : null;
                                    row.put("email", email != null && !email.isBlank() ? email : null);
                                    row.put("phoneNumber", p.getPhoneNumber());
                                    row.put("location", p.getLocation());
                                    row.put("postalCode", p.getPostalCode());
                                    if (td.getMinFee() != null && td.getMaxFee() != null) {
                                        row.put("hourlyRate", td.getMinFee() + "-" + td.getMaxFee());
                                    } else if (td.getRate() != null && !td.getRate().isBlank()) {
                                        row.put("hourlyRate", td.getRate());
                                    } else {
                                        row.put("hourlyRate", null);
                                    }
                                    return row;
                                });
                            })
                            .collectList()
                            .map(teacherRows -> {
                                Map<String, Object> response = new HashMap<>();
                                response.put("teachers", teacherRows);
                                response.put("currentPage", adjustedPage + 1);
                                response.put("totalItems", total);
                                response.put("totalPages", totalPages);

                                LoggingUtility.logInfo(logger, transactionId, "getAllPaginatedTeachers",
                                        System.currentTimeMillis() - startTime, CODE_SUCCESS,
                                        "Retrieved paginated teachers",
                                        "Page: " + (adjustedPage + 1) + ", Size: " + size,
                                        null);
                                return ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        SUCCESS,
                                        response
                                );
                            });
                })
                .doOnError(error -> {
                    LoggingUtility.logError(logger, transactionId, "getAllPaginatedTeachers",
                            System.currentTimeMillis() - startTime, 500,
                            "Failed to retrieve paginated teachers",
                            error.getMessage(),
                            "Page: " + page + ", Size: " + size + ", Name: " + displayName,
                            null);
                });
    }

    private boolean isCompanyFieldsEmpty(TeacherProfile teacherProfile) {
        return teacherProfile.getCompanyName() == null || teacherProfile.getRole() == null ||
                teacherProfile.getDisplayName() == null || teacherProfile.getLocation() == null ||
                teacherProfile.getPhoneNumber() == null
                || teacherProfile.getCompanyName().isEmpty() || teacherProfile.getRole().isEmpty() ||
                teacherProfile.getDisplayName().isEmpty() || teacherProfile.getLocation().isEmpty() ||
                teacherProfile.getPhoneNumber().isEmpty();
    }

    private boolean isIndividualFieldsEmpty(TeacherProfile teacherProfile) {
        return teacherProfile.getDisplayName() == null || teacherProfile.getGender() == null ||
                teacherProfile.getBirthdate() == null || teacherProfile.getLocation() == null ||
                teacherProfile.getPostalCode() == null || teacherProfile.getPhoneNumber() == null ||
                teacherProfile.getProfileDescription() == null
                || teacherProfile.getDisplayName().isEmpty()
                || teacherProfile.getGender().isEmpty() || teacherProfile.getLocation().isEmpty() ||
                teacherProfile.getPostalCode().isEmpty() || teacherProfile.getPhoneNumber().isEmpty() ||
                teacherProfile.getProfileDescription().isEmpty();
    }
}