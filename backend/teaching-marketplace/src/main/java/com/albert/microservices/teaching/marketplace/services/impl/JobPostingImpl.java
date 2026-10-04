package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.JobPosting;
import com.albert.microservices.teaching.marketplace.repositories.CustomJobPostingRepository;
import com.albert.microservices.teaching.marketplace.repositories.JobPostingRepository;
import com.albert.microservices.teaching.marketplace.requests.UpdateJobPost;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.JobPostingService;
import com.albert.microservices.teaching.marketplace.utils.LoggerHelper;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class JobPostingImpl implements JobPostingService {
    private static final Logger logger = LoggerFactory.getLogger(JobPostingImpl.class);
    private final LoggerHelper loggerHelper;
    private final JobPostingRepository jobPostingRepository;
    private final CustomJobPostingRepository customJobPostingRepository;

    public JobPostingImpl(LoggerHelper loggerHelper, JobPostingRepository jobPostingRepository, CustomJobPostingRepository customJobPostingRepository) {
        this.loggerHelper = loggerHelper;
        this.jobPostingRepository = jobPostingRepository;
        this.customJobPostingRepository = customJobPostingRepository;
    }

    @Override
    public Mono<ApiResponse> createJob(JobPosting jobPosting) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "createJob";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Creating new job posting", jobPosting.toString(), null);

        jobPosting.setCreatedAt(LocalDateTime.now());

        // Calculate coins based on the job's attributes
        int coins = calculateCoins(jobPosting);

        // Set the calculated coins value in the job posting
        jobPosting.setCoins(coins);

        return jobPostingRepository.save(jobPosting)
                .flatMap(postedJob -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                            "Requirement posted successfully", null, "");
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Requirement posted successfully",
                            OPERATION_SUCCESS,
                            postedJob));
                })
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration, CODE_SERVER_ERROR,
                            "Error posting job", ex.getMessage(), jobPosting.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error posting job, please try again",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }

    // Method to calculate the number of coins based on job attributes
    private int calculateCoins(JobPosting jobPosting) {
        // Base coins assigned based on job type (this is just an example; adjust to your needs)
        int baseCoins = 30;
        // Budget multiplier: 1 coin per $10 in budget, rounded up to the nearest integer
        int budgetCoins = calculateBudgetCoins(jobPosting.getBudget(), jobPosting.getFrequency());
        // Job nature adjustment: if the job is urgent, multiply coins
        int jobNatureCoins = jobPosting.getJobRequirements().toLowerCase(Locale.ROOT).contains("urgent") ? 70 : 0;
        // Combine all factors to calculate final coins
        int totalCoins = baseCoins + budgetCoins + jobNatureCoins;

        // Ensure the total coins is at least 1 (no job can have 0 coins)
        return Math.max(totalCoins, 1);
    }

    private int calculateBudgetCoins(BigDecimal budget, String frequency) {
        double budgetValue = budget.doubleValue();
        if (frequency.equalsIgnoreCase("Per Hour"))
            if (budgetValue <= 5) {
                return 20;  // Budget of 5 per hour or less adds 20 coins
            } else if (budgetValue > 5 && budgetValue <= 10) {
                return 30;  // Budget between 5 and 10 per hour adds 30 coins
            } else if (budgetValue > 10 && budgetValue <= 15) {
                return 40;  // Budget between 10 and 15 per hour adds 40 coins
            } else if (budgetValue > 15 && budgetValue <= 20) {
                return 60;  // Budget between 10 and 15 per hour adds 40 coins
            } else {
                return 60;  // Budget greater than 15 per hour adds 50 coins
            }
        else return 20;
    }

    @Override
    public Mono<ApiResponse> updateJob(UpdateJobPost jobPosting, Integer jobId, Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "updateJob";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Updating job posting", jobPosting.toString(), null);

        return jobPostingRepository.findByJobIdAndUserIdAndJobStatus(jobId, userId,"Open")
                .flatMap(existingRequirement -> {
                    // Update the existing fields with new values
                    existingRequirement.setLocation(jobPosting.getLocation());
                    existingRequirement.setPhone(jobPosting.getPhone());
                    existingRequirement.setJobRequirements(jobPosting.getJobRequirements());
                    existingRequirement.setSubjects(jobPosting.getSubjects());
                    existingRequirement.setLevel(jobPosting.getLevel());
                    existingRequirement.setJobNature(jobPosting.getJobNature());
                    existingRequirement.setMeetingOptions(jobPosting.getMeetingOptions());
                    existingRequirement.setBudget(jobPosting.getBudget());
                    existingRequirement.setFrequency(jobPosting.getFrequency());
                    existingRequirement.setNumberOfTutors(jobPosting.getNumberOfTutors());
                    existingRequirement.setJobType(jobPosting.getJobType());
                    existingRequirement.setLanguage(jobPosting.getLanguage());
                    existingRequirement.setJobCategory(jobPosting.getJobCategory());
                    existingRequirement.setUpdatedAt(LocalDateTime.now());

                    // Save the updated job posting
                    return jobPostingRepository.save(existingRequirement)
                            .flatMap(updatedRequirement -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                                        "Job posting updated successfully", null, "");
                                return Mono.just(ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        "Job posting updated successfully",
                                        OPERATION_SUCCESS,
                                        updatedRequirement));
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration, CODE_NOT_FOUND,
                            "Job posting not found", "Job ID: " + jobId + ", User ID: " + userId, null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Job posting not found",
                            NOTFOUND,
                            null));
                }))
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration, CODE_SERVER_ERROR,
                            "Error updating job posting", ex.getMessage(), jobPosting.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error updating job posting. Please try again.",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }

    @Override
    public Mono<ApiResponse> closeJob(Integer jobId, Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "closeJob";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Closing job posting", "Job ID: " + jobId + ", User ID: " + userId, null);

        return jobPostingRepository.findByJobIdAndUserIdAndJobStatus(jobId, userId,"Open")
                .flatMap(existingRequirement -> {
                    // Update the existing fields with new values
                    existingRequirement.setJobStatus("Closed");
                    // Save the updated job posting
                    return jobPostingRepository.save(existingRequirement)
                            .flatMap(updatedRequirement -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                                        "Job posting closed successfully", null, "");
                                return Mono.just(ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        "Job posting closed successfully",
                                        OPERATION_SUCCESS,
                                        updatedRequirement));
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration, CODE_NOT_FOUND,
                            "Job posting not found", "Job ID: " + jobId + ", User ID: " + userId, null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Job posting not found",
                            NOTFOUND,
                            null));
                }))
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration, CODE_SERVER_ERROR,
                            "Error closing job posting", ex.getMessage(), "Job ID: " + jobId, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error closing job posting. Please try again.",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }

    @Override
    public Mono<ApiResponse> getSingleJob(Integer jobId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getSingleJob";

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Fetching single job posting", "Job ID: " + jobId, null);

        return jobPostingRepository.findByJobId(jobId)
                .flatMap(postedJob -> {
                    // Mask contact details in the jobRequirements field
                    String maskedJobRequirements = maskContactDetails(postedJob.getJobRequirements());

                    // Create a new job object with masked details
                    postedJob.setJobRequirements(maskedJobRequirements);

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                            "Job posting fetched successfully", null, "");

                    // Return the response
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Job posting fetched successfully",
                            OPERATION_SUCCESS,
                            postedJob));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration, CODE_NOT_FOUND,
                            "Job posting not found", "Job ID: " + jobId, null, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            "Job posting not found",
                            NOTFOUND,
                            null));
                }))
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration, CODE_SERVER_ERROR,
                            "Error fetching job posting", ex.getMessage(), "Job ID: " + jobId, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error updating job posting. Please try again.",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }

    private String maskContactDetails(String text) {
        // Regular expression for phone numbers (including formats like +254, 07******, etc.)
        String phoneRegex = "(\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4})";
        // Regular expression for emails
        String emailRegex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";

        // Mask phone numbers
        text = text.replaceAll(phoneRegex, "xxxxxxxxxxx");
        // Mask emails
        text = text.replaceAll(emailRegex, "xxxxx@xxxxx.com");

        // You can add more specific masking for phrases like "whatsapp", "call me via", etc., if needed.
        String[] contactPhrases = {
                "call me via", "whatsapp", "contact me", "email me", "connect with me",
                "dm me", "reach me at", "text me", "call me on", "message me",
                "hit me up", "ping me", "inbox me", "send me a message", "talk to me on",
                "get in touch", "reach out", "you can call", "drop me a line",
                "send me an email", "snap me", "follow me on", "add me", "add me on",
                "find me on", "telegram me", "skype me", "talk to me", "chat with me",
                "let's connect", "give me a ring", "drop me a text", "hangouts me",
                "facetime me", "meet me on", "zoom me", "my number is", "my email is",
                "available on", "call at", "message via", "add me via",
                "add my number", "add me to your contacts",
                "reach me through", "call through", "chat via", "reach me on",
                "drop me your number", "my contact is", "reach me directly",
                "talk to me through", "feel free to call", "feel free to message",
                "get back to me", "call anytime", "text anytime",
                "reach me anytime", "you can whatsapp me",
                "email me at", "hit me on", "in touch via", "my telegram is",
                "on signal", "on viber", "reach me over", "snapchat me",
                "send a dm", "drop me a dm", "contact through",
                "connect through", "add me in", "catch me on"
        };

        for (String phrase : contactPhrases) {
            text = text.replaceAll("(?i)" + Pattern.quote(phrase.toLowerCase()), phrase);
        }

        return text;
    }

    @Override
    public Mono<ApiResponse> getJobs(int page, int size, String jobCategory, String meetingOptions,
                                     String jobStatus, String dateFilter, String startDate, String endDate, String keyword) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getJobs";

        Map<String, Object> params = new HashMap<>();
        params.put("page", page);
        params.put("size", size);
        params.put("jobCategory", jobCategory);
        params.put("meetingOptions", meetingOptions);
        params.put("jobStatus", jobStatus);
        params.put("dateFilter", dateFilter);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        params.put("keyword", keyword);

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Fetching filtered jobs", params.toString(), null);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return customJobPostingRepository.findFilteredJobs(jobCategory, meetingOptions, jobStatus, dateFilter, startDate, endDate, keyword, pageable)
                .collectList()
                .zipWith(customJobPostingRepository.countFilteredJobs(jobCategory, meetingOptions, jobStatus, dateFilter, startDate, endDate, keyword))
                .flatMap(tuple -> {
                    List<JobPosting> jobs = tuple.getT1();
                    long totalItems = tuple.getT2();
                    int totalPages = (int) Math.ceil((double) totalItems / size);

                    jobs.forEach(postedJob -> {
                        String masked = maskContactDetails(postedJob.getJobRequirements());
                        postedJob.setJobRequirements(masked);
                    });

                    if (jobs.isEmpty()) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, processName, duration, CODE_NOT_FOUND,
                                "No results found for filtered jobs", params.toString(), null,"");
                        return Mono.just(ApiResponse.createResponse(CODE_NOT_FOUND, "No results found", NOTFOUND, null));
                    }

                    Map<String, Object> result = new HashMap<>();
                    result.put("jobs", jobs);
                    result.put("currentPage", page + 1);
                    result.put("totalItems", totalItems);
                    result.put("totalPages", totalPages);

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                            "Job postings fetched successfully", null, "");

                    return Mono.just(ApiResponse.createResponse(CODE_SUCCESS, "Job postings fetched successfully", OPERATION_SUCCESS, result));
                })
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration, CODE_SERVER_ERROR,
                            "Error fetching job postings", ex.getMessage(), params.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error fetching job postings",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }

    @Override
    public Mono<ApiResponse> getUserJobs(int page, int size, int userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getUserJobs";

        Map<String, Object> params = new HashMap<>();
        params.put("page", page);
        params.put("size", size);
        params.put("userId", userId);

        LoggingUtility.logInfo(logger, transactionId, processName, null, CODE_SUCCESS,
                "Fetching user jobs", params.toString(), null);

        int skip = page * size;

        Mono<List<JobPosting>> jobsMono = jobPostingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .skip(skip)
                .take(size)
                .map(job -> {
                    job.setJobRequirements(maskContactDetails(job.getJobRequirements()));
                    return job;
                })
                .collectList();

        Mono<Long> countMono = jobPostingRepository.countByUserId(userId);

        return Mono.zip(jobsMono, countMono)
                .flatMap(tuple -> {
                    List<JobPosting> jobs = tuple.getT1();
                    long totalItems = tuple.getT2();
                    int totalPages = (int) Math.ceil((double) totalItems / size);

                    if (jobs.isEmpty()) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, processName, duration, CODE_NOT_FOUND,
                                "No results found for user jobs", null,"","");
                        return Mono.just(ApiResponse.createResponse(
                                CODE_NOT_FOUND,
                                "No results found",
                                NOTFOUND,
                                null));
                    }

                    Map<String, Object> result = new HashMap<>();
                    result.put("jobs", jobs);
                    result.put("currentPage", page + 1);
                    result.put("totalItems", totalItems);
                    result.put("totalPages", totalPages);

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration, CODE_SUCCESS,
                            "User job postings fetched successfully", null, "");

                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Job postings fetched successfully",
                            OPERATION_SUCCESS,
                            result));
                })
                .onErrorResume(ex -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration, CODE_SERVER_ERROR,
                            "Error fetching user job postings", ex.getMessage(), params.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Error fetching job postings",
                            SERVER_ERROR,
                            ex.getLocalizedMessage()));
                });
    }
}