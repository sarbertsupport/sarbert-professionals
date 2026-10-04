package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.JobPosting;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CustomJobPostingRepository {
    Flux<JobPosting> findFilteredJobs(String jobCategory, String meetingOptions, String jobStatus,
                                      String dateFilter, String startDate, String endDate, String keyword, Pageable pageable);

    Mono<Long> countFilteredJobs(String jobCategory, String meetingOptions, String jobStatus,
                                 String dateFilter, String startDate, String endDate, String keyword);
}
