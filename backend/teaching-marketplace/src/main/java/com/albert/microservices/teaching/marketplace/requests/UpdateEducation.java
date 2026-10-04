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
public class UpdateEducation {
    private Integer educationId;
    private String institutionName;
    private String degreeType;
    private String degreeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String association;
    private String specialization;
    private Double score;

}
