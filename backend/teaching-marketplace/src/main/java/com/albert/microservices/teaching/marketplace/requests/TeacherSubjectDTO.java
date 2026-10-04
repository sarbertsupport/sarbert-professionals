package com.albert.microservices.teaching.marketplace.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeacherSubjectDTO {
    private Integer userId;
    private Integer teacherId;
    private String subjectName;
}
