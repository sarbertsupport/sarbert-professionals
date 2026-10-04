package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
@Table("availability")
public class Availability {
    @Id
    private Integer availabilityId;

    @NotBlank(message = "Availability name cannot be blank")
    @Size(min = 1, max = 100, message = "Availability name must be between 1 and 100 characters")
    @Pattern(
            regexp = "^[a-zA-Z0-9\\s\\-_]+$",
            message = "Availability name can only contain alphanumeric characters, spaces, hyphens, and underscores"
    )
    private String availabilityName;
}