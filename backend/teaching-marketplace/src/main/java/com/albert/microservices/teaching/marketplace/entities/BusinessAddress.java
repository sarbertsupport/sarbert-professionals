package com.albert.microservices.teaching.marketplace.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table("business_addresses")
public class BusinessAddress {
    @Id
    private Long id;

    @Column("business_name")
    private String businessName;

    @Column("business_description")
    private String businessDescription;

    @Column("contact_person")
    private String contactPerson;

    @Column("email")
    private String email;

    @Column("phone")
    private String phone;

    @Column("address_line_1")
    private String addressLine1;

    @Column("address_line_2")
    private String addressLine2;

    @Column("city")
    private String city;

    @Column("state")
    private String state;

    @Column("postal_code")
    private String postalCode;

    @Column("country")
    private String country;

    @Column("physical_location")
    private String physicalLocation;

    @Column("website")
    private String website;

    @Column("tax_id")
    private String taxId;

    @Column("registration_number")
    private String registrationNumber;

    @Column("is_default")
    private Boolean isDefault = false;

    @Column("is_active")
    private Boolean isActive = true;

    @Column("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public BusinessAddress(String businessName, String businessDescription, String contactPerson,
                          String email, String phone, String addressLine1, String addressLine2,
                          String city, String state, String postalCode, String country,
                          String physicalLocation, String website, String taxId, String registrationNumber) {
        this.businessName = businessName;
        this.businessDescription = businessDescription;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.physicalLocation = physicalLocation;
        this.website = website;
        this.taxId = taxId;
        this.registrationNumber = registrationNumber;
    }
} 