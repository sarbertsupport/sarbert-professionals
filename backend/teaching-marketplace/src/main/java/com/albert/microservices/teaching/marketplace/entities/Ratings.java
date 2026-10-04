package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("ratings")
public class Ratings {

    @Id
    private Integer id;

    @NotNull(message = "Teacher ID cannot be null")
    @Positive(message = "Teacher ID must be a positive number")
    private Integer teacherId;

    @NotNull(message = "Student ID cannot be null")
    @Positive(message = "Student ID must be a positive number")
    private Integer studentId;

    @NotNull(message = "Rating cannot be null")
    @DecimalMin(value = "0.5", message = "Minimum rating is 0.5")
    @DecimalMax(value = "5.0", message = "Maximum rating is 5.0")
    @Digits(integer = 1, fraction = 1, message = "Rating must have 1 integer and 1 decimal place")
    private Double rating;

    @NotBlank(message = "Comment cannot be blank")
    @Size(min = 10, max = 500, message = "Comment must be between 10-500 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\p{P}\\p{Z}\\p{Sm}\\p{Sc}]+$",
            message = "Comment contains invalid characters")
    private String comment;

    @PastOrPresent(message = "Creation date cannot be in the future")
    private LocalDateTime createdAt;

    @NotNull(message = "User ID cannot be null")
    @Positive(message = "User ID must be a positive number")
    private Integer userId;

    // Custom validation to ensure student can't rate themselves
    @AssertTrue(message = "Student cannot rate themselves")
    public boolean isNotSelfRating() {
        return !studentId.equals(teacherId);
    }

    // Custom validation for rating increments
    @AssertTrue(message = "Rating must be in 0.5 increments")
    public boolean isValidRatingIncrement() {
        return rating == null || (rating * 2) % 1 == 0;
    }
}