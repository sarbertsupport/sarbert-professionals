package com.albert.microservices.teaching.marketplace.requests;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTeacherProfile {
    private Integer teacherId;
    private String companyName;
    private String role;
    private String displayName;
    private String gender;
    private LocalDate birthdate;
    private String location;
    private String postalCode;
    private String phoneNumber;
    private String profileDescription;
    private String imagePath;
    private boolean isCompany;
    private boolean showClients;
}
