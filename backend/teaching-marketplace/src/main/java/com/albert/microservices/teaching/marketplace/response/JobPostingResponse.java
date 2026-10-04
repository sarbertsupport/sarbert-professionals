package com.albert.microservices.teaching.marketplace.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JobPostingResponse {

    private Integer jobId;

    private String userId;

    private String location;

    private String phone;

    private String jobRequirements;

    private List<String> subjects;

    private String level;

    private String jobNature;

    private String meetingOptions;

    private BigDecimal budget;

    private String frequency;

    private Integer numberOfTutors;

    private String jobType;

    private String language;

    private String profileImg;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private int coins;
    private String jobStatus;
}
