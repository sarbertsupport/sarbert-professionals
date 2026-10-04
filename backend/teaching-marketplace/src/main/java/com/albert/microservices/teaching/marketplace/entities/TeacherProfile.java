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
@Table("teacher_profiles")
public class TeacherProfile {
    @Id
    private Integer teacherId;

    @NotNull(message = "User ID cannot be null")
    @Positive(message = "User ID must be a positive number")
    @Column("user_id")
    private Integer userId;

    @Size(max = 100, message = "Company name must be less than 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()&]*$",
            message = "Company name contains invalid characters")
    private String companyName;

    @Size(max = 50, message = "Role must be less than 50 characters")
    private String role;

    @NotBlank(message = "Display name cannot be blank")
    @Size(min = 2, max = 50, message = "Display name must be between 2-50 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-'.’]+$",
            message = "Display name contains invalid characters")
    private String displayName;

    @NotBlank(message = "Gender cannot be blank")
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

    @Size(max = 1000, message = "Profile description must be less than 1000 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\p{P}\\p{Z}\\p{Sm}\\p{Sc}]*$",
            message = "Profile description contains invalid characters")
    private String profileDescription;

    private String imagePath;

    private boolean isCompany;
    private boolean showClients;

}