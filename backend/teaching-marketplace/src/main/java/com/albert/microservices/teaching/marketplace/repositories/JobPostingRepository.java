package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.JobPosting;
import com.albert.microservices.teaching.marketplace.response.JobPostingResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface JobPostingRepository extends ReactiveCrudRepository<JobPosting, Integer> {
    Mono<JobPosting> findByJobIdAndUserIdAndJobStatus(int jobId, Integer userId,String jobStatus);
    Mono<JobPostingResponse> findByJobId(int jobId);
    Flux<JobPosting> findByUserIdOrderByCreatedAtDesc(Integer userId);
    Mono<Long> countByUserId(int userId);
    Flux<JobPosting> findAllBy(Pageable pageable);
    Flux<JobPosting> findAllByJobRequirementsContainingIgnoreCase(String keyword, Pageable pageable);
    Mono<Long> countByJobRequirementsContainingIgnoreCase(String keyword);

}
