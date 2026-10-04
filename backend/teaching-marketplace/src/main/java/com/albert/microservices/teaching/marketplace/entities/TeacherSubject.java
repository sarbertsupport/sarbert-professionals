package com.albert.microservices.teaching.marketplace.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("teacher_subjects")
public class TeacherSubject {
    @Id
    private Integer id;
    private Integer teacherId;
    @Column("subject_id")
    private Integer subjectId;
    @Column("user_id")
    private Integer userId;
}