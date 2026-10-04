package com.albert.microservices.teaching.marketplace.entities;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("pricing")
@Data
public class Pricing {
    @Id
    private Long id;

    @NotNull(message = "Base price per coin cannot be null")
    @DecimalMin(value = "0.001", message = "Price must be at least 0.001")
    @Column("base_price_per_coin")
    private BigDecimal basePricePerCoin;

    @Column("updated_at")
    private LocalDateTime updatedAt;

    @Column("created_at")
    private LocalDateTime createdAt;

    @NotBlank(message = "Creator cannot be blank")
    @Size(max = 50, message = "Creator name must be less than 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-._@]+$",
            message = "Creator name contains invalid characters")
    @Column("created_by")
    private String createdBy;

    @Size(max = 50, message = "Updater name must be less than 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-._@]*$",
            message = "Updater name contains invalid characters")
    @Column("updated_by")
    private String updatedBy;

    // Custom validation for price precision
    @AssertTrue(message = "Price must be positive and non-zero")
    public boolean isPriceValid() {
        return basePricePerCoin != null &&
                basePricePerCoin.compareTo(BigDecimal.ZERO) > 0;
    }
}