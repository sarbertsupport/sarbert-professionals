package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.Subject;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface SubjectRepository extends ReactiveCrudRepository<Subject, Integer> {
    Mono<Subject> findBySubjectName(String subjectName);
    Mono<Subject> findBySubjectId(Integer subjectId);
}