package com.albert.microservices.teaching.marketplace.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("billing_addresses")
public class BillingAddress {
    @Id
    private Long id;

    @Column("user_id")
    private Integer userId;

    @Column("full_name")
    private String fullName;

    private String country;
    private String state;
    private String city;
    private String address;
    @Column("contact_no")
    private String contactNo;

    public BillingAddress(Integer userId, String fullName, String country, String state,
                          String city, String address,String contactNo) {
        this.userId = userId;
        this.fullName = fullName;
        this.country = country;
        this.state = state;
        this.city = city;
        this.address = address;
        this.contactNo= contactNo;
    }
}