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
public class UpdateExperience {
    private Integer experienceId;
    private String organizationName;
    private String designation;
    private LocalDate startDate;
    private LocalDate endDate;
    private String association;
    private String jobDescription;
    private boolean currentJob;
}
