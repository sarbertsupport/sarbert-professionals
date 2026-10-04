package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.Education;
import com.albert.microservices.teaching.marketplace.entities.Experience;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface ExperienceRepository extends ReactiveCrudRepository<Experience, Integer> {
    Mono<Boolean> existsByTeacherIdAndOrganizationNameAndDesignationAndStartDateAndEndDate(
            Integer teacherId, String organizationName, String designation,
            LocalDate startDate, LocalDate endDate);

    Mono<Experience> findByExperienceId(int experienceId);
    Flux<Experience> findByTeacherId(int teacherId);
    Flux<Experience> findByUserId(int userId);
    Mono<Experience> findByExperienceIdAndUserId(Integer experienceId, Integer userId);

}