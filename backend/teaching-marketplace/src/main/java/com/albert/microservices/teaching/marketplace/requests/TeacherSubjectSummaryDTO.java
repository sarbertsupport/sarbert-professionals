package com.albert.microservices.teaching.marketplace.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeacherSubjectSummaryDTO {
    private Integer userId;
    private Integer teacherId;
    private List<String> subjects;
}
