package com.albert.microservices.teaching.marketplace.requests;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherDto {
    private Integer teacherId;
    private Integer userId;
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
}
