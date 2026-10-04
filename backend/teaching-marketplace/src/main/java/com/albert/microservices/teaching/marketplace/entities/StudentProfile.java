package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("student_profiles")
public class StudentProfile {
    @Id
    private Integer id;
    @Column("user_id")
    private Integer userId;

    @NotBlank(message = "Full name cannot be blank")
    @Size(min = 2, max = 100, message = "Full name must be between 2-100 characters")
    @Pattern(regexp = "^[\\p{L}\\s\\-'.’]+$",
            message = "Full name can only contain letters, spaces, hyphens, and apostrophes")
    private String fullName;

    @NotBlank(message = "Gender cannot be blank")
    @Pattern(regexp = "^(Male|Female|Other)$",
            message = "Invalid gender selection")
    private String gender;

    @NotNull(message = "Birthdate cannot be null")
    @Past(message = "Birthdate must be in the past")
    private LocalDate birthdate;

    @NotBlank(message = "Location cannot be blank")
    @Size(max = 100, message = "Location must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()]+$",
            message = "Location contains invalid characters")
    private String location;

    @NotBlank(message = "Postal code cannot be blank")
    @Size(min = 3, max = 20, message = "Postal code must be 3-20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\-\\s]+$",
            message = "Postal code contains invalid characters")
    private String postalCode;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^[+\\d\\s\\-\\(\\)]{7,20}$",
            message = "Invalid phone number format")
    private String phoneNumber;

    @Size(max = 500, message = "Bio must be less than 500 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\p{P}\\p{Z}\\p{Sm}\\p{Sc}]*$",
            message = "Bio contains invalid characters")
    private String bio;

    private String imagePath;

    @PastOrPresent(message = "Creation date cannot be in the future")
    private LocalDateTime createdAt;

    @PastOrPresent(message = "Update date cannot be in the future")
    private LocalDateTime updatedAt;

    // Custom validation for age restriction
    @AssertTrue(message = "Student must be at least 5 years old")
    public boolean isAgeValid() {
        if (birthdate == null) return false;
        return birthdate.plusYears(5).isBefore(LocalDate.now());
    }

    // Custom validation for phone number format
    @AssertTrue(message = "Phone number must contain at least 7 digits")
    public boolean isPhoneNumberValid() {
        if (phoneNumber == null) return false;
        long digitCount = phoneNumber.chars().filter(Character::isDigit).count();
        return digitCount >= 7;
    }

}