package com.albert.microservices.teaching.marketplace.profiledtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherBasicInfoDto {
    private Integer teacherId;
    private String displayName;
    private String gender;
    private String location;
    private String postalCode;
    private String phoneNumber;
    private String profileDescription;
    private String imagePath;
    private String rate;
    private Double maxFee;
    private Double minFee;
}
