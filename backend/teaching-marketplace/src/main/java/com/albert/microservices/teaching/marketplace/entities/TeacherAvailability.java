package com.albert.microservices.teaching.marketplace.entities;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("teacher_availability")
public class TeacherAvailability {
    private Integer teacherId;
    private Integer availabilityId;
}
