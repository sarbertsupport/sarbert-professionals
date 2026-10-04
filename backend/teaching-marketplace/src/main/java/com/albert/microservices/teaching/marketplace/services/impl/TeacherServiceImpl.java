package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.*;
import com.albert.microservices.teaching.marketplace.profiledtos.*;
import com.albert.microservices.teaching.marketplace.repositories.*;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeacherService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {
    private static final Logger logger = LoggerFactory.getLogger(TeacherServiceImpl.class);
    private final TeacherProfileRepository teacherProfileRepository;
    private final TeachingDetailRepository teachingDetailRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final TeacherAvailabilityRepository teacherAvailabilityRepository;
    private final UserRepository userRepository;

    @Override
    public Mono<ApiResponse> getAllTeachersBasicInfo(int page, int size,
                                                     String gender, Double minFee, Double maxFee,
                                                     Boolean onlineAvailability, Boolean homeAvailability,
                                                     Integer subjectId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        int offset = page * size;

        Map<String, Object> requestParams = new HashMap<>();
        requestParams.put("page", page);
        requestParams.put("size", size);
        requestParams.put("gender", gender);
        requestParams.put("minFee", minFee);
        requestParams.put("maxFee", maxFee);
        requestParams.put("onlineAvailability", onlineAvailability);
        requestParams.put("homeAvailability", homeAvailability);
        requestParams.put("subjectId", subjectId);

        Flux<TeacherBasicInfoDto> teachersFlux = teacherProfileRepository
                .findTeachersWithFilters(gender, minFee, maxFee, onlineAvailability,
                        homeAvailability, subjectId, offset, size)
                .flatMap(profile -> teachingDetailRepository.findByTeacherId(profile.getTeacherId())
                        .map(detail -> {
                            TeacherBasicInfoDto dto = new TeacherBasicInfoDto();
                            dto.setTeacherId(profile.getTeacherId());
                            dto.setDisplayName(profile.getDisplayName().split(" ")[0]);
                            dto.setGender(profile.getGender());
                            dto.setLocation(profile.getLocation());
                            dto.setPostalCode(profile.getPostalCode());
                            dto.setPhoneNumber(maskPhoneNumber(profile.getPhoneNumber()));
                            dto.setProfileDescription(maskContactDetails(profile.getProfileDescription()));
                            dto.setImagePath(profile.getImagePath());
                            dto.setRate(detail.getRate());
                            dto.setMaxFee(detail.getMaxFee());
                            dto.setMinFee(detail.getMinFee());
                            return dto;
                        }));

        Mono<Long> countMono = teacherProfileRepository.countTeachersWithFilters(
                gender, minFee, maxFee, onlineAvailability, homeAvailability, subjectId);

        return Mono.zip(teachersFlux.collectList(), countMono)
                .flatMap(tuple -> {
                    List<TeacherBasicInfoDto> teachers = tuple.getT1();
                    long totalItems = tuple.getT2();
                    int totalPages = (int) Math.ceil((double) totalItems / size);

                    if (teachers.isEmpty()) {
                        LoggingUtility.logWarn(logger, transactionId, "getAllTeachersBasicInfo",
                                System.currentTimeMillis() - startTime, 404,
                                "No teachers found with given filters", null, requestParams.toString(),"");
                        return Mono.just(ApiResponse.createResponse(
                                404,
                                "No teachers found",
                                "NOT_FOUND",
                                null));
                    }

                    Map<String, Object> result = new HashMap<>();
                    result.put("teachers", teachers);
                    result.put("currentPage", page + 1);
                    result.put("totalItems", totalItems);
                    result.put("totalPages", totalPages);

                    LoggingUtility.logInfo(logger, transactionId, "getAllTeachersBasicInfo",
                            System.currentTimeMillis() - startTime, 200,
                            "Teachers fetched successfully", null,
                            "");
                    return Mono.just(ApiResponse.createResponse(
                            200,
                            "Teachers fetched successfully",
                            "SUCCESS",
                            result));
                })
                .onErrorResume(ex -> {
                    LoggingUtility.logError(logger, transactionId, "getAllTeachersBasicInfo",
                            System.currentTimeMillis() - startTime, 500,
                            "Error fetching teachers", ex.getMessage(),
                            requestParams.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            500,
                            "Error fetching teachers",
                            "SERVER_ERROR",
                            ex.getMessage()));
                });
    }

    @Override
    public Mono<ApiResponse> getTeacherProfile(Integer teacherId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        Mono<TeacherProfile> profileMono = teacherProfileRepository.findById(teacherId);
        Mono<TeachingDetail> teachingDetailMono = teachingDetailRepository.findByTeacherId(teacherId)
                .defaultIfEmpty(new TeachingDetail());
        Flux<Education> educationFlux = educationRepository.findByTeacherId(teacherId);
        Flux<Experience> experienceFlux = experienceRepository.findByTeacherId(teacherId);
        Flux<Subject> subjectFlux = teacherSubjectRepository.findSubjectsByTeacherId(teacherId);
        Flux<Availability> availabilityFlux = teacherAvailabilityRepository.findAvailabilitiesByTeacherId(teacherId);

        return Mono.zip(profileMono, teachingDetailMono, educationFlux.collectList(),
                experienceFlux.collectList(), subjectFlux.collectList(),
                availabilityFlux.collectList())
                .flatMap(tuple -> {
                    TeacherProfile profile = tuple.getT1();
                    TeachingDetail teachingDetail = tuple.getT2();
                    List<Education> educations = tuple.getT3();
                    List<Experience> experiences = tuple.getT4();
                    List<Subject> subjects = tuple.getT5();
                    List<Availability> availabilities = tuple.getT6();

                    Mono<Optional<AdminUserContact>> contactMono = profile.getUserId() == null
                            ? Mono.just(Optional.empty())
                            : userRepository.findAdminContactByUserId(profile.getUserId())
                                    .map(Optional::of)
                                    .defaultIfEmpty(Optional.empty());

                    return contactMono.map(contactOpt -> {
                                AdminUserContact userContact = contactOpt.orElse(null);
                                TeacherProfileDto dto = new TeacherProfileDto();
                                dto.setTeacherId(profile.getTeacherId());
                                dto.setUserId(profile.getUserId());
                                dto.setCompanyName(profile.getCompanyName());
                                dto.setRole(profile.getRole());
                                dto.setDisplayName(profile.getDisplayName().split(" ")[0]);
                                dto.setGender(profile.getGender());
                                dto.setBirthdate(profile.getBirthdate());
                                dto.setLocation(profile.getLocation());
                                dto.setPostalCode(profile.getPostalCode());
                                dto.setPhoneNumber(maskPhoneNumber(profile.getPhoneNumber()));
                                String em = userContact != null ? userContact.getEmail() : null;
                                dto.setEmail(em != null && !em.isBlank() ? em : null);
                                dto.setProfileDescription(maskContactDetails(profile.getProfileDescription()));
                                dto.setImagePath(profile.getImagePath());
                                dto.setCompany(profile.isCompany());

                                dto.setRate(teachingDetail.getRate());
                                dto.setMaxFee(teachingDetail.getMaxFee());
                                dto.setMinFee(teachingDetail.getMinFee());
                                dto.setPaymentDetails(teachingDetail.getPaymentDetails());
                                dto.setTotalExpYears(teachingDetail.getTotalExpYears());
                                dto.setOnlineExpYears(teachingDetail.getOnlineExpYears());
                                dto.setTravelWillingness(teachingDetail.getTravelWillingness());
                                dto.setOnlineAvailability(teachingDetail.getOnlineAvailability());
                                dto.setHomeAvailability(teachingDetail.getHomeAvailability());
                                dto.setTravelDistance(teachingDetail.getTravelDistance());
                                dto.setDigitalPen(teachingDetail.getDigitalPen());
                                dto.setHomeworkHelp(teachingDetail.getHomeworkHelp());
                                dto.setCurrentlyEmployed(teachingDetail.getCurrentlyEmployed());
                                dto.setWorkPreference(teachingDetail.getWorkPreference());

                                dto.setEducations(educations.stream().map(edu -> {
                                    EducationDto eduDto = new EducationDto();
                                    eduDto.setInstitutionName(edu.getInstitutionName());
                                    eduDto.setDegreeType(edu.getDegreeType());
                                    eduDto.setDegreeName(edu.getDegreeName());
                                    eduDto.setStartDate(edu.getStartDate());
                                    eduDto.setEndDate(edu.getEndDate());
                                    eduDto.setAssociation(edu.getAssociation());
                                    eduDto.setSpecialization(edu.getSpecialization());
                                    eduDto.setScore(edu.getScore());
                                    return eduDto;
                                }).toList());

                                dto.setExperiences(experiences.stream().map(exp -> {
                                    ExperienceDto expDto = new ExperienceDto();
                                    expDto.setOrganizationName(exp.getOrganizationName());
                                    expDto.setDesignation(exp.getDesignation());
                                    expDto.setStartDate(exp.getStartDate());
                                    expDto.setEndDate(exp.getEndDate());
                                    expDto.setAssociation(exp.getAssociation());
                                    expDto.setJobDescription(exp.getJobDescription());
                                    expDto.setCurrentJob(exp.isCurrentJob());
                                    return expDto;
                                }).toList());

                                dto.setSubjects(subjects.stream().map(sub -> {
                                    SubjectDto subDto = new SubjectDto();
                                    subDto.setSubjectId(sub.getSubjectId());
                                    subDto.setSubjectName(sub.getSubjectName());
                                    return subDto;
                                }).toList());

                                dto.setAvailabilities(availabilities.stream().map(avail -> {
                                    AvailabilityDto availDto = new AvailabilityDto();
                                    availDto.setAvailabilityId(avail.getAvailabilityId());
                                    availDto.setAvailabilityName(avail.getAvailabilityName());
                                    return availDto;
                                }).toList());

                                LoggingUtility.logInfo(logger, transactionId, "getTeacherProfile",
                                        System.currentTimeMillis() - startTime, 200,
                                        "Teacher profile fetched successfully", null,
                                        "");
                                return ApiResponse.createResponse(
                                        200,
                                        "Teacher profile fetched successfully",
                                        "SUCCESS",
                                        dto);
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, "getTeacherProfile",
                            System.currentTimeMillis() - startTime, 404,
                            "Teacher not found", "Teacher ID: " + teacherId, null,"");
                    return Mono.just(ApiResponse.createResponse(
                            404,
                            "Teacher not found",
                            "NOT_FOUND",
                            null));
                }))
                .onErrorResume(ex -> {
                    LoggingUtility.logError(logger, transactionId, "getTeacherProfile",
                            System.currentTimeMillis() - startTime, 500,
                            "Error fetching teacher profile", ex.getMessage(),
                            "Teacher ID: " + teacherId, null);
                    return Mono.just(ApiResponse.createResponse(
                            500,
                            "Error fetching teacher profile",
                            "SERVER_ERROR",
                            ex.getMessage()));
                });
    }

    private String maskContactDetails(String text) {
        // Regular expression for phone numbers (including formats like +254, 07******, etc.)
        String phoneRegex = "(\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4})";
        // Regular expression for emails
        String emailRegex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";

        // Mask phone numbers
        text = text.replaceAll(phoneRegex, "xxxxxxxxxxx");
        // Mask emails
        text = text.replaceAll(emailRegex, "xxxxx@xxxxx.com");

        // You can add more specific masking for phrases like "whatsapp", "call me via", etc., if needed.
        String[] contactPhrases = {
                "call me via", "whatsapp", "contact me", "email me", "connect with me",
                "dm me", "reach me at", "text me", "call me on", "message me",
                "hit me up", "ping me", "inbox me", "send me a message", "talk to me on",
                "get in touch", "reach out", "you can call", "drop me a line",
                "send me an email", "snap me", "follow me on", "add me", "add me on",
                "find me on", "telegram me", "skype me", "talk to me", "chat with me",
                "let's connect", "give me a ring", "drop me a text", "hangouts me",
                "facetime me", "meet me on", "zoom me", "my number is", "my email is",
                "available on", "call at", "message via", "add me via",
                "add my number", "add me to your contacts",
                "reach me through", "call through", "chat via", "reach me on",
                "drop me your number", "my contact is", "reach me directly",
                "talk to me through", "feel free to call", "feel free to message",
                "get back to me", "call anytime", "text anytime",
                "reach me anytime", "you can whatsapp me",
                "email me at", "hit me on", "in touch via", "my telegram is",
                "on signal", "on viber", "reach me over", "snapchat me",
                "send a dm", "drop me a dm", "contact through",
                "connect through", "add me in", "catch me on"
        };

        for (String phrase : contactPhrases) {
            text = text.replaceAll("(?i)" + Pattern.quote(phrase.toLowerCase()), phrase);
        }

        return text;
    }

    private String maskPhoneNumber(String phoneNumber) {
        String phoneRegex = "(\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4})";
        String res = phoneNumber.replaceAll(phoneRegex, "xxxxxxxxxxx");
        return res;
    }
}