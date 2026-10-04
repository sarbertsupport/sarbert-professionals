package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.JobPosting;
import com.albert.microservices.teaching.marketplace.requests.UpdateJobPost;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.JobPostingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class JobPostingController {
    private final JobPostingService jobPostingService;

    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    @PostMapping("/post/jobs")
    public Mono<ApiResponse> postRequirement(@RequestBody @Valid JobPosting jobPosting) {
        return jobPostingService.createJob(jobPosting);
    }

    @PutMapping("/update/jobs/{jobId}")
    public Mono<ApiResponse> updateRequirement(@RequestBody @Valid UpdateJobPost jobPosting,
                                               @PathVariable Integer jobId,
                                               @RequestParam("userId") Integer userId) {
        return jobPostingService.updateJob(jobPosting, jobId,userId);
    }
    @PutMapping("/close/jobs/{jobId}")
    public Mono<ApiResponse> closeRequirements(@PathVariable Integer jobId,
                                               @RequestParam("userId") Integer userId) {
        return jobPostingService.closeJob(jobId,userId);
    }
    @GetMapping("/jobs/{jobId}")
    public Mono<ApiResponse> fetchSingleRequirement(@PathVariable Integer jobId) {
        return jobPostingService.getSingleJob(jobId);
    }
    @GetMapping("/jobs")
    public Mono<ApiResponse> fetchRequirements(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "jobCategory", required = false) String jobCategory,
            @RequestParam(value = "meetingOptions", required = false) String meetingOptions,
            @RequestParam(value = "jobStatus", required = false) String jobStatus,
            @RequestParam(value = "dateFilter", required = false) String dateFilter,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        int adjustedPage = page - 1;
        return jobPostingService.getJobs(adjustedPage, size, jobCategory, meetingOptions, jobStatus, dateFilter, startDate, endDate, keyword);
    }
    @GetMapping("/jobs/users/{userId}")
    public Mono<ApiResponse> fetchUserRequirements(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @PathVariable("userId") int userId
    ) {
        int adjustedPage = page - 1;
        return jobPostingService.getUserJobs(adjustedPage, size,userId);
    }

}
