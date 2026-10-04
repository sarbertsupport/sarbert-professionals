package com.albert.microservices.teaching.marketplace.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "job_applicants")
public class JobApplicant {
    @Id
    private Long id;

    @Column("job_id")
    private Long jobId;

    @Column("applicant_id")
    private Long applicantId;

    @Column("applied_at")
    private LocalDateTime appliedAt;

    @Column("coins_deducted")
    private Integer coinsDeducted;

    @Column("status")
    private String status;
}
