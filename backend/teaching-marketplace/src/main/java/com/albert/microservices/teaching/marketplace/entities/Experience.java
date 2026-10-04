package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("experience")
public class Experience {

    @Id
    private Integer experienceId;

    @NotNull(message = "Teacher ID cannot be null")
    @Positive(message = "Teacher ID must be a positive number")
    private Integer teacherId;

    @NotBlank(message = "Organization name cannot be blank")
    @Size(max = 100, message = "Organization name must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]+$",
            message = "Organization name contains invalid characters")
    private String organizationName;

    @NotBlank(message = "Designation cannot be blank")
    @Size(max = 100, message = "Designation must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()/]+$",
            message = "Designation contains invalid characters")
    private String designation;

    @NotNull(message = "Start date cannot be null")
    @PastOrPresent(message = "Start date must be in the past or present")
    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 100, message = "Association must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]*$",
            message = "Association contains invalid characters")
    private String association;

    @Size(max = 1000, message = "Job description must be less than 1000 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&:;!?@#$%*+/=]*$",
            message = "Job description contains invalid characters")
    private String jobDescription;

    @Column("is_current_job")
    private boolean currentJob;

    @NotNull(message = "User ID cannot be null")
    @Positive(message = "User ID must be a positive number")
    private Integer userId;

    // Custom validation for date consistency
    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateValid() {
        return endDate == null || endDate.isAfter(startDate);
    }

    // Custom validation for current job
    @AssertTrue(message = "Current job cannot have an end date")
    public boolean isCurrentJobValid() {
        return !currentJob || endDate == null;
    }
}