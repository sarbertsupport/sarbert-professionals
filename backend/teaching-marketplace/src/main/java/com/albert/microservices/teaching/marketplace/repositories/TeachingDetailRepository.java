package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.TeachingDetail;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface TeachingDetailRepository extends ReactiveCrudRepository<TeachingDetail, Integer> {
    Mono<TeachingDetail> findByTeacherId(int teacherId);
    Mono<TeachingDetail> findByUserId(int userId);
    Mono<TeachingDetail> findByTeacherIdAndUserId(int id,int userId);
}