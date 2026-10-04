package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.JobPosting;
import com.albert.microservices.teaching.marketplace.requests.UpdateJobPost;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface JobPostingService {
    Mono<ApiResponse> createJob(JobPosting jobPosting);
    Mono<ApiResponse> updateJob(UpdateJobPost jobPosting, Integer jobId, Integer userId);
    Mono<ApiResponse> getSingleJob(Integer jobId);
//    Mono<ApiResponse> getJobs(int page, int size);
Mono<ApiResponse> getJobs(int page, int size, String jobCategory, String meetingOptions,
                          String jobStatus, String dateFilter, String startDate, String endDate, String keyword);
    Mono<ApiResponse> getUserJobs(int page, int size, int userId);
    Mono<ApiResponse> closeJob(Integer jobId,Integer userId);
}
