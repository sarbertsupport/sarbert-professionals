package com.albert.microservices.teaching.marketplace.profiledtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EducationDto {
    private String institutionName;
    private String degreeType;
    private String degreeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String association;
    private String specialization;
    private Double score;
}
