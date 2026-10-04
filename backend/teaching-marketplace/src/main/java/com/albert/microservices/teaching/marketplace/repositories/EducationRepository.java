package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.Education;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface EducationRepository extends ReactiveCrudRepository<Education, Integer> {
    Flux<Education> findByTeacherId(Integer teacherId);
    Flux<Education> findByUserId(Integer userId);
    Mono<Education> findByTeacherIdAndDegreeTypeAndDegreeName(Integer teacherId, String degreeType, String degreeName);
    Mono<Education> findByEducationIdAndUserId(Integer educationId, Integer userId);
}