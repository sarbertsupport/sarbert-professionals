package com.albert.microservices.teaching.marketplace.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("teachers_profile_information")
public class TeacherProfileInfo {
    @Id
    @Column("teacherid")
    private Long teacherId;
    @Column("fullname")
    private String fullName;
    private String image;
    private String gender;
    private double rating;
    @Column("totalteachingexperience")
    private int totalTeachingExperience;
    @Column("teachingonline")
    private boolean teachingOnline;
    @Column("onlineteachingexperience")
    private int onlineTeachingExperience;
    @Column("traveldistance")
    private double travelDistance;
    private String education;
    @Column("feedetails")
    private String feeDetails;
    private String description;
    private String location;
    @Column("teachesathome")
    private boolean teachesAtHome;
    @Column("homeworkhelp")
    private boolean homeworkHelp;
    @Column("paymentdetails")
    private String paymentDetails;
    @Column("travelwillingness")
    private boolean travelWillingness;
    private String subjects;
    @Column("highestratedreview")
    private String reviews;
}
