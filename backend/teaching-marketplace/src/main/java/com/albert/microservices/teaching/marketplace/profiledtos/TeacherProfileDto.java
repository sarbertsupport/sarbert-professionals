package com.albert.microservices.teaching.marketplace.profiledtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherProfileDto {
    private Integer teacherId;
    private Integer userId;
    private String companyName;
    private String role;
    private String displayName;
    private String gender;
    private LocalDate birthdate;
    private String location;
    private String postalCode;
    private String phoneNumber;
    /** Account email (from users table); included for authenticated admin views. */
    private String email;
    private String profileDescription;
    private String imagePath;
    private boolean isCompany;
    // Teaching details
    private String rate;
    private Double maxFee;
    private Double minFee;
    private String paymentDetails;
    private Integer totalExpYears;
    private Integer onlineExpYears;
    private Boolean travelWillingness;
    private Boolean onlineAvailability;
    private Boolean homeAvailability;
    private int travelDistance;
    private Boolean digitalPen;
    private Boolean homeworkHelp;
    private Boolean currentlyEmployed;
    private String workPreference;
    // Lists
    private List<EducationDto> educations;
    private List<ExperienceDto> experiences;
    private List<SubjectDto> subjects;
    private List<AvailabilityDto> availabilities;
}