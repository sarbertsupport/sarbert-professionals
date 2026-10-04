package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("education")
public class Education {
    @Id
    private Integer educationId;

    @NotNull(message = "Teacher ID cannot be null")
    @Positive(message = "Teacher ID must be a positive number")
    private Integer teacherId;

    @NotBlank(message = "Institution name cannot be blank")
    @Size(max = 200, message = "Institution name must be less than 200 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]+$",
            message = "Institution name contains invalid characters")
    private String institutionName;

    @NotBlank(message = "Degree type cannot be blank")
    @Size(max = 50, message = "Degree type must be less than 50 characters")
    @Pattern(regexp = "^[\\p{L}\\s\\-]+$",
            message = "Degree type can only contain letters, spaces and hyphens")
    private String degreeType;

    @NotBlank(message = "Degree name cannot be blank")
    @Size(max = 100, message = "Degree name must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]+$",
            message = "Degree name contains invalid characters")
    private String degreeName;

    @NotNull(message = "Start date cannot be null")
    @PastOrPresent(message = "Start date must be in the past or present")
    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 100, message = "Association must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]*$",
            message = "Association contains invalid characters")
    private String association;

    @Size(max = 100, message = "Specialization must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]*$",
            message = "Specialization contains invalid characters")
    private String specialization;

    @DecimalMin(value = "0.0", message = "Score cannot be negative")
    @DecimalMax(value = "4.0", message = "Score cannot exceed 4.0")
    @Digits(integer = 1, fraction = 2, message = "Score must have max 1 integer and 2 fraction digits")
    private Double score;

    @NotNull(message = "User ID cannot be null")
    @Positive(message = "User ID must be a positive number")
    private Integer userId;

    // Custom validation for date consistency
    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateValid() {
        return endDate == null || endDate.isAfter(startDate);
    }
}