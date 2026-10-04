package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("job_postings")
public class JobPosting {

    @Id
    @Column("job_id")
    private Integer jobId;

    @NotBlank(message = "User ID cannot be blank")
    @Column("user_id")
    private String userId;

    @NotBlank(message = "Location cannot be blank")
    @Size(max = 100, message = "Location must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()]+$",
            message = "Location contains invalid characters")
    @Column("location")
    private String location;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^[+\\d\\s\\-\\(\\)]{7,20}$",
            message = "Invalid phone number format")
    @Column("phone")
    private String phone;

    @NotBlank(message = "Job requirements cannot be blank")
    @Size(min = 20, max = 2000, message = "Requirements must be 20-2000 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()!?@#$%&*+=:;]+$",
            message = "Requirements contain invalid characters")
    @Column("job_requirements")
    private String jobRequirements;

    @NotBlank(message = "Subjects cannot be blank")
    @Size(max = 200, message = "Subjects must be less than 200 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]+$",
            message = "Subjects contain invalid characters")
    @Column("subjects")
    private String subjects;

    @NotBlank(message = "Level cannot be blank")
    @Size(max = 50, message = "Level must be less than 50 characters")
    @Column("level")
    private String level;

    @NotBlank(message = "Job nature cannot be blank")
    @Size(max = 50, message = "Job nature must be less than 50 characters")
    @Column("job_nature")
    private String jobNature;

    @NotBlank(message = "Meeting options cannot be blank")
    @Size(max = 100, message = "Meeting options must be less than 100 characters")
    @Column("meeting_options")
    private String meetingOptions;

    @NotNull(message = "Budget cannot be null")
    @DecimalMin(value = "5.00", message = "Budget must be at least 5.00")
    @Digits(integer = 6, fraction = 2, message = "Budget must have max 6 integer and 2 fraction digits")
    @Column("budget")
    private BigDecimal budget;

    @NotBlank(message = "Frequency cannot be blank")
    @Size(max = 50, message = "Frequency must be less than 50 characters")
    @Column("frequency")
    private String frequency;

    @NotNull(message = "Number of tutors cannot be null")
    @Min(value = 1, message = "At least 1 tutor required")
    @Max(value = 20, message = "Maximum 20 tutors allowed")
    @Column("number_of_tutors")
    private Integer numberOfTutors;

    @NotBlank(message = "Job type cannot be blank")
    @Size(max = 50, message = "Job type must be less than 50 characters")
    @Column("job_type")
    private String jobType;

    @NotBlank(message = "Language cannot be blank")
    @Size(max = 50, message = "Language must be less than 50 characters")
    @Column("language")
    private String language;

    @Column("profile_img")
    private String profileImg;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;

    @Min(value = 0, message = "Coins cannot be negative")
    @Max(value = 10000, message = "Coins cannot exceed 10,000")
    private int coins;

    @NotBlank(message = "Job category cannot be blank")
    @Size(max = 50, message = "Job category must be less than 50 characters")
    @Column("job_category")
    private String jobCategory;

    @Column("job_status")
    private String jobStatus;

    // Custom validation for timestamps
    @AssertTrue(message = "Updated date must be after creation date")
    public boolean isTimestampsValid() {
        return updatedAt == null || updatedAt.isAfter(createdAt) || updatedAt.isEqual(createdAt);
    }

}