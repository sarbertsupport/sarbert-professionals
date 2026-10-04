package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.repositories.JobApplicantRepository;
import com.albert.microservices.teaching.marketplace.repositories.JobPostingRepository;
import com.albert.microservices.teaching.marketplace.repositories.StudentProfileRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.ContactService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Service
public class ContactServiceImpl implements ContactService {
    private static final Logger logger = LoggerFactory.getLogger(ContactServiceImpl.class);

    private final JobApplicantRepository jobApplicantRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JobPostingRepository jobPostingRepository;

    public ContactServiceImpl(JobApplicantRepository jobApplicantRepository,
                              StudentProfileRepository studentProfileRepository,
                              JobPostingRepository jobPostingRepository) {
        this.jobApplicantRepository = jobApplicantRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jobPostingRepository = jobPostingRepository;
    }

    public Mono<ApiResponse> getPhoneNumber(Integer jobId, Integer applicantId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("jobId=%d, applicantId=%d", jobId, applicantId);

        LoggingUtility.logInfo(logger, transactionId, "getPhoneNumber",
                null, 200, "Request received", requestPayload, null);

        return jobApplicantRepository.findByJobIdAndApplicantId(jobId, applicantId)
                .flatMap(jobApplicant -> {
                    LoggingUtility.logInfo(logger, transactionId, "getPhoneNumber",
                            null, 200, "Job application found", requestPayload, "");

                    return jobPostingRepository.findById(jobId)
                            .flatMap(job -> {
                                LoggingUtility.logInfo(logger, transactionId, "getPhoneNumber",
                                        null, 200, "Job posting found", requestPayload,"");

                                return studentProfileRepository.findByUserId(Integer.parseInt(job.getUserId()))
                                        .map(jobPosterProfile -> {
                                            long duration = System.currentTimeMillis() - startTime;

                                            if (jobPosterProfile.getPhoneNumber() == null ||
                                                    jobPosterProfile.getPhoneNumber().isEmpty()) {
                                                LoggingUtility.logWarn(logger, transactionId, "getPhoneNumber",
                                                        duration, 404, "Phone number not available",
                                                        "Job poster has no phone number registered",
                                                        requestPayload, null);
                                                return ApiResponse.createResponse(404,
                                                        "Job poster's phone number not available",
                                                        "Job poster has no phone number registered",
                                                        null);
                                            }

                                            LoggingUtility.logInfo(logger, transactionId, "getPhoneNumber",
                                                    duration, 200, "Phone number retrieved",
                                                    requestPayload, "");
                                            return ApiResponse.createResponse(200,
                                                    "Job poster's phone number retrieved successfully",
                                                    "Success",
                                                    jobPosterProfile.getPhoneNumber());
                                        });
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "getPhoneNumber",
                            duration, 410, "Application not found",
                            "Applicant has not applied for this job",
                            requestPayload, null);
                    return Mono.just(
                            ApiResponse.createResponse(410,
                                    "You must first apply/connect with job poster to get the contact number",
                                    "Application not found",
                                    null)
                    );
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getPhoneNumber",
                            duration, 500, "Error retrieving phone number",
                            e.getMessage(),
                            requestPayload, null);
                    return Mono.just(
                            ApiResponse.createResponse(500,
                                    "Error retrieving phone number",
                                    e.getMessage(),
                                    null)
                    );
                });
    }
}