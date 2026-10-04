package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.TeacherProfileInfo;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface TeacherProfileInfoRepository extends ReactiveCrudRepository<TeacherProfileInfo, Long> {
    Mono<TeacherProfileInfo> findByTeacherId(int teacherId);

}
