package com.albert.microservices.teaching.marketplace.requests;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NotBlank
public class UpdateTeachingDetails {
    private String rate;
    private Double maxFee;
    private Double minFee;
    private String paymentDetails;
    private Integer totalExpYears;
    private Boolean travelWillingness;
    private Boolean onlineAvailability;
    private Boolean homeAvailability;
    private int travelDistance;
    private Boolean digitalPen;
    private Boolean homeworkHelp;
    private Boolean currentlyEmployed;
    private String workPreference;
    private Integer onlineExpYears;
}
