package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BillingAddressRequest {

    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-'.]+$", message = "Full name contains invalid characters")
    private String fullName;

    @NotBlank(message = "Country cannot be blank")
    @Size(max = 60, message = "Country must be less than 60 characters")
    private String country;

    @NotBlank(message = "State cannot be blank")
    @Size(max = 60, message = "State must be less than 60 characters")
    private String state;

    @NotBlank(message = "City cannot be blank")
    @Size(max = 60, message = "City must be less than 60 characters")
    private String city;

    @NotBlank(message = "Address cannot be blank")
    @Size(max = 200, message = "Address must be less than 200 characters")
    private String address;

    private String email;
    private String contactNo;
}