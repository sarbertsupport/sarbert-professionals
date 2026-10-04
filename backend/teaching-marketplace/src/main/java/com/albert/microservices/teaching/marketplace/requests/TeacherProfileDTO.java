package com.albert.microservices.teaching.marketplace.requests;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherProfileDTO {
    private String fullName;
    private String image;
    private double rating;
    private List<String> subjects;
    private String experience;
    private String education;
    private String feeDetails;
    private String reviews;
    private String description;
    private String location;
    private int travelDistance;
    private String totalTeachingExperience;
    private boolean teachingOnline;
    private String onlineTeachingExperience;
    private boolean teachesAtHome;
    private boolean homeworkHelp;
    private String gender;

}
