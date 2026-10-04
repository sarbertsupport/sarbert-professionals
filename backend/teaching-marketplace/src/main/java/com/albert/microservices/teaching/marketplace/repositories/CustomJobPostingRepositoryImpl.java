package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.JobPosting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.relational.core.query.Criteria;
import org.springframework.data.relational.core.query.Query;
import org.springframework.r2dbc.core.Parameter;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Repository
public class CustomJobPostingRepositoryImpl implements CustomJobPostingRepository {
    @Autowired
    private R2dbcEntityTemplate template;

    @Override
    public Flux<JobPosting> findFilteredJobs(String jobCategory, String meetingOptions, String jobStatus,
                                             String dateFilter, String startDate, String endDate, String keyword, Pageable pageable) {
        Criteria criteria = buildCriteria(jobCategory, meetingOptions, jobStatus, dateFilter, startDate, endDate, keyword);
        return template.select(JobPosting.class)
                .matching(Query.query(criteria)
                        .sort(Sort.by(Sort.Direction.DESC, "created_at")) // Add this line
                        .with(pageable))
                .all();
    }

    @Override
    public Mono<Long> countFilteredJobs(String jobCategory, String meetingOptions, String jobStatus,
                                        String dateFilter, String startDate, String endDate, String keyword) {
        Criteria criteria = buildCriteria(jobCategory, meetingOptions, jobStatus, dateFilter, startDate, endDate, keyword);
        return template.count(Query.query(criteria), JobPosting.class);
    }

    private Criteria buildCriteria(String jobCategory, String meetingOptions, String jobStatus,
                                   String dateFilter, String startDate, String endDate, String keyword) {
        Criteria criteria = Criteria.empty();
        LocalDateTime now = LocalDateTime.now();

        if (jobCategory != null && !jobCategory.equalsIgnoreCase("all")) {
            criteria = criteria.and("job_category").is(jobCategory);
        }

        if (meetingOptions != null && !meetingOptions.equalsIgnoreCase("all")) {
            criteria = criteria.and("meeting_options").is(meetingOptions);
        }

        if (jobStatus != null && !jobStatus.equalsIgnoreCase("all")) {
            criteria = criteria.and("job_status").is(jobStatus);
        }

        if (dateFilter != null && !dateFilter.equalsIgnoreCase("anytime")) {
            LocalDateTime dateFrom = switch (dateFilter) {
                case "oneHour" -> now.minusHours(1);
                case "today" -> now.toLocalDate().atStartOfDay();
                case "past24Hours" -> now.minusHours(24);
                case "past3Days" -> now.minusDays(3);
                case "pastWeek" -> now.minusWeeks(1);
                case "past2Weeks" -> now.minusWeeks(2);
                case "pastMonth" -> now.minusMonths(1);
                case "olderThanMonth" -> now.minusMonths(100);
                default -> null;
            };

            if (dateFilter.equals("olderThanMonth")) {
                criteria = criteria.and("created_at").lessThan(now.minusMonths(1));
            } else if (dateFrom != null) {
                criteria = criteria.and("created_at").greaterThanOrEquals(dateFrom);
            }
        }

        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate).plusDays(1);
            criteria = criteria.and("created_at").between(start, end);
        }

        if (keyword != null && !keyword.isEmpty()) {
            // SECURE: Use parameterized query instead of string concatenation
            criteria = criteria.and("job_requirements").like(Parameter.from("%" + keyword + "%"));
        }

        return criteria;
    }
}