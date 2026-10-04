package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("teaching_details")
public class TeachingDetail {
    @Id
    private Integer id;

    @NotNull(message = "Teacher ID cannot be null")
    @Positive(message = "Teacher ID must be a positive number")
    private Integer teacherId;

    @NotBlank(message = "Rate cannot be blank")
    private String rate;

    @NotNull(message = "Maximum fee cannot be null")
    private Double maxFee;

    @NotNull(message = "Minimum fee cannot be null")
    private Double minFee;

    @NotBlank(message = "Payment details cannot be blank")
    @Size(max = 500, message = "Payment details must be less than 500 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-.,'()/:;]+$",
            message = "Payment details contain invalid characters")
    private String paymentDetails;

    @NotNull(message = "Total experience years cannot be null")
    @Min(value = 0, message = "Total experience years cannot be negative")
    private Integer totalExpYears;

    @NotNull(message = "Online experience years cannot be null")
    @Min(value = 0, message = "Online experience years cannot be negative")

    @NotNull(message = "Travel willingness must be specified")
    private Boolean travelWillingness;

    @NotNull(message = "Online availability must be specified")
    private Boolean onlineAvailability;

    @NotNull(message = "Home availability must be specified")
    private Boolean homeAvailability;

    @Min(value = 0, message = "Travel distance cannot be negative")
    private int travelDistance;

    @NotNull(message = "Digital pen availability must be specified")
    private Boolean digitalPen;

    @NotNull(message = "Homework help availability must be specified")
    private Boolean homeworkHelp;

    @NotNull(message = "Current employment status must be specified")
    private Boolean currentlyEmployed;

    @NotBlank(message = "Work preference cannot be blank")
    private String workPreference;

    @NotNull(message = "User ID cannot be null")
    @Positive(message = "User ID must be a positive number")
    private Integer userId;

    @NotBlank(message = "onlineExpYears cannot be blank")
    private Integer onlineExpYears;

}