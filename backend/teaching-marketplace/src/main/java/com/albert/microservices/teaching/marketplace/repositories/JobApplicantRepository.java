package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.JobApplicant;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface JobApplicantRepository extends ReactiveCrudRepository<JobApplicant, Long> {
    Mono<Boolean> existsByJobIdAndApplicantId(Long jobId, Long applicantId);
    Mono<JobApplicant> findByJobIdAndApplicantId(Integer jobId, Integer applicantId);
    Flux<JobApplicant> findByJobId(Long jobId);
    Flux<JobApplicant> findByApplicantId(Long applicantId);
    @Query("""
    SELECT COUNT(DISTINCT ja.applicant_id) 
    FROM job_applicants ja
    JOIN job_postings jp ON ja.job_id = jp.job_id
    WHERE ja.job_id = :jobId
    AND ja.applicant_id != CAST(jp.user_id AS BIGINT)
    """)
    Mono<Long> countDistinctSendersByJobId(@Param("jobId") Long jobId);
}