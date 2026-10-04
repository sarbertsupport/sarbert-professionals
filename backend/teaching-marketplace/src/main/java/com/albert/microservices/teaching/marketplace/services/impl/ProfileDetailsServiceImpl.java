package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.*;
import com.albert.microservices.teaching.marketplace.repositories.*;
import com.albert.microservices.teaching.marketplace.requests.TeacherProfileDTO;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.ProfileDetailsService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class ProfileDetailsServiceImpl implements ProfileDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(ProfileDetailsServiceImpl.class);
    private static final String PROCESS_NAME = "TeacherProfileService";

    private final TeacherProfileRepository teacherProfileRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final TeachingDetailRepository teachingDetailRepository;
    private final EducationRepository educationRepository;
    private final RatingsRepository ratingsRepository;

    public ProfileDetailsServiceImpl(TeacherProfileRepository teacherProfileRepository, TeacherSubjectRepository teacherSubjectRepository, SubjectRepository subjectRepository, TeachingDetailRepository teachingDetailRepository, EducationRepository educationRepository, RatingsRepository ratingsRepository) {
        this.teacherProfileRepository = teacherProfileRepository;
        this.teacherSubjectRepository = teacherSubjectRepository;
        this.subjectRepository = subjectRepository;
        this.teachingDetailRepository = teachingDetailRepository;
        this.educationRepository = educationRepository;
        this.ratingsRepository = ratingsRepository;
    }

    @Override
    public Mono<ApiResponse> getTeacherProfile(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        Instant startTime = Instant.now();

        LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null,
                CODE_SUCCESS, "Starting to fetch teacher profile",
                "teacherId: " + teacherId, null);

        return teacherProfileRepository.findById(teacherId)
                .flatMap(teacherProfile -> {
                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null,
                            CODE_SUCCESS, "Found teacher profile",
                            null, "teacherId: " + teacherId);

                    // Fetch teaching details
                    Mono<TeachingDetail> teachingDetailMono = teachingDetailRepository.findByTeacherId(teacherId)
                            .doOnError(e -> LoggingUtility.logError(logger, transactionId, PROCESS_NAME,
                                    Duration.between(startTime, Instant.now()).toMillis(),
                                    CODE_SERVER_ERROR, "Error fetching teaching details",
                                    e.getMessage(), null, null));

                    // Fetch education details
                    Mono<List<Education>> educationMono = educationRepository.findByTeacherId(teacherId)
                            .collectList()
                            .doOnError(e -> LoggingUtility.logError(logger, transactionId, PROCESS_NAME,
                                    Duration.between(startTime, Instant.now()).toMillis(),
                                    CODE_SERVER_ERROR, "Error fetching education details",
                                    e.getMessage(), null, null));

                    // Fetch ratings
                    Mono<List<Ratings>> ratingsMono = ratingsRepository.findByTeacherId(teacherId)
                            .collectList()
                            .doOnError(e -> LoggingUtility.logError(logger, transactionId, PROCESS_NAME,
                                    Duration.between(startTime, Instant.now()).toMillis(),
                                    CODE_SERVER_ERROR, "Error fetching ratings",
                                    e.getMessage(), null, null));

                    // Fetch teacher subjects
                    Mono<List<TeacherSubject>> teacherSubjectMono = teacherSubjectRepository.findByTeacherId(teacherId)
                            .collectList()
                            .doOnError(e -> LoggingUtility.logError(logger, transactionId, PROCESS_NAME,
                                    Duration.between(startTime, Instant.now()).toMillis(),
                                    CODE_SERVER_ERROR, "Error fetching teacher subjects",
                                    e.getMessage(), null, null));

                    // Combine all Monos
                    return Mono.zip(teachingDetailMono, educationMono, ratingsMono, teacherSubjectMono)
                            .map(tuple -> {
                                TeachingDetail teachingDetail = tuple.getT1();
                                List<Education> educationList = tuple.getT2();
                                List<Ratings> ratingsList = tuple.getT3();
                                List<TeacherSubject> teacherSubjects = tuple.getT4();

                                LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, null,
                                        CODE_SUCCESS, "Successfully fetched all profile components",
                                        null, null);

                                return buildTeacherProfileDTO(teacherProfile, teachingDetail, educationList, ratingsList, teacherSubjects);
                            });
                })
                .map(teacherProfileDTO -> {
                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                    LoggingUtility.logInfo(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SUCCESS, "Teacher profile fetched successfully",
                            null, "");

                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Teacher profile fetched successfully",
                            SUCCESS,
                            teacherProfileDTO);
                })
                .defaultIfEmpty(ApiResponse.createResponse(
                        CODE_NOT_FOUND,
                        "Teacher profile not found for teacher ID: " + teacherId,
                        NOTFOUND,
                        null))
                .doOnError(e -> {
                    long duration = Duration.between(startTime, Instant.now()).toMillis();
                    LoggingUtility.logError(logger, transactionId, PROCESS_NAME, duration,
                            CODE_SERVER_ERROR, "Error fetching teacher profile",
                            e.getMessage(), "teacherId: " + teacherId, null);
                });
    }

    private TeacherProfileDTO buildTeacherProfileDTO(TeacherProfile teacherProfile, TeachingDetail teachingDetail, List<Education> educationList, List<Ratings> ratingsList, List<TeacherSubject> teacherSubjects) {
        TeacherProfileDTO profileDTO = new TeacherProfileDTO();
        profileDTO.setFullName(teacherProfile.getDisplayName());
        profileDTO.setImage(teacherProfile.getImagePath());
        profileDTO.setGender(teacherProfile.getGender());

        // Calculate rating
        if (!ratingsList.isEmpty()) {
            double totalRating = ratingsList.stream().mapToDouble(Ratings::getRating).average().orElse(0.0);
            profileDTO.setRating(totalRating);
        }

        // Subjects
        Flux<String> subjectFlux = Flux.fromIterable(teacherSubjects)
                .flatMap(teacherSubject -> subjectRepository.findById(teacherSubject.getSubjectId())
                        .map(Subject::getSubjectName));

        List<String> subjects = subjectFlux.collectList().block();
        profileDTO.setSubjects(subjects);

        // Experience
        if (teachingDetail != null) {
            int totalTeachingExpYears = teachingDetail.getTotalExpYears();
            profileDTO.setTotalTeachingExperience(totalTeachingExpYears + " years");

            if (teachingDetail.getOnlineAvailability()) {
                profileDTO.setTeachingOnline(true);
                profileDTO.setOnlineTeachingExperience(teachingDetail.getOnlineExpYears() + " years");
            }

            if (teachingDetail.getTravelWillingness()) {
                profileDTO.setTravelDistance(teachingDetail.getTravelDistance());
            }
        }

        // Education
        if (!educationList.isEmpty()) {
            Education latestEducation = educationList.stream()
                    .max(Comparator.comparing(Education::getEndDate))
                    .orElse(null);

            if (latestEducation != null) {
                String educationDetails = latestEducation.getDegreeType() + " (" +
                        latestEducation.getStartDate().getYear() + " - " +
                        (latestEducation.getEndDate() != null ? latestEducation.getEndDate().getYear() : "Present") +
                        ") from " + latestEducation.getInstitutionName();
                profileDTO.setEducation(educationDetails);
            }
        }

        // Fee details
        if (teachingDetail != null) {
            String feeDetails = "$" + teachingDetail.getRate() + "/hour";
            profileDTO.setFeeDetails(feeDetails);
        }

        // Reviews - Assuming one review for simplicity
        if (!ratingsList.isEmpty()) {
            Ratings latestRating = ratingsList.stream()
                    .max(Comparator.comparing(Ratings::getCreatedAt))
                    .orElse(null);

            if (latestRating != null) {
                profileDTO.setReviews(latestRating.getComment());
            }
        }

        // Description
        profileDTO.setDescription(teacherProfile.getProfileDescription());

        // Location
        profileDTO.setLocation(teacherProfile.getLocation());

        // Other details
        profileDTO.setTeachesAtHome(teachingDetail != null && teachingDetail.getHomeAvailability());
        profileDTO.setHomeworkHelp(teachingDetail != null && teachingDetail.getHomeworkHelp());

        return profileDTO;
    }
}