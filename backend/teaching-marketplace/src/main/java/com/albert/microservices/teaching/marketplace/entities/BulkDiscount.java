package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("bulk_discounts")
@Data
public class BulkDiscount {
    @Id
    private Long id;

    @NotNull(message = "Minimum coins cannot be null")
    @Min(value = 1, message = "Minimum coins must be at least 1")
    private Integer minCoins;

    @NotNull(message = "Discount percentage cannot be null")
    @DecimalMax(value = "100.00", message = "Discount cannot exceed 100%")
    @Digits(integer = 3, fraction = 2, message = "Discount must have max 3 integer and 2 fraction digits")
    private BigDecimal discountPercentage;

    @NotNull(message = "Active status cannot be null")
    private Boolean active;

    private LocalDateTime updatedAt;

    private LocalDateTime createdAt;

    @NotBlank(message = "Creator cannot be blank")
    @Size(max = 50, message = "Creator name must be less than 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-._@]+$", message = "Creator name contains invalid characters")
    private String createdBy;

    @Size(max = 50, message = "Updater name must be less than 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-._@]*$", message = "Updater name contains invalid characters")
    private String updatedBy;
}