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
@Table("subjects")
public class Subject {
    @Id
    private Integer subjectId;

    @NotBlank(message = "Subject name cannot be blank")
    @Size(min = 2, max = 50, message = "Subject name must be between 2-50 characters")
    @Pattern(
            regexp = "^[\\p{L}\\p{N}\\s\\-()&]+$",
            message = "Subject name can only contain letters, numbers, spaces, hyphens, parentheses, and ampersands"
    )
    private String subjectName;

}