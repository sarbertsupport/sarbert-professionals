package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.Ratings;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
@Repository
public interface RatingsRepository extends ReactiveCrudRepository<Ratings, Integer> {
    Mono<Boolean> existsByTeacherIdAndStudentId(Integer teacherId, Integer studentId);
    Flux<Ratings> findByTeacherId(Integer teacherId);
}
