package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.Subject;
import com.albert.microservices.teaching.marketplace.entities.TeacherSubject;
import com.albert.microservices.teaching.marketplace.requests.TeacherSubjectDTO;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface TeacherSubjectRepository extends ReactiveCrudRepository<TeacherSubject, Integer> {
    Mono<Boolean> existsByTeacherId(Integer teacherId);

    Flux<TeacherSubject> findByTeacherId(Integer teacherId);

    @Query("SELECT COUNT(*) FROM teacher_subjects WHERE teacher_id = :teacherId")
    Mono<Long> countByTeacherId(Integer teacherId);

    @Query("""
                SELECT ts.user_id, ts.teacher_id, s.subject_name
                FROM teacher_subjects ts
                JOIN subjects s ON ts.subject_id = s.subject_id
                WHERE ts.user_id = :userId
            """)
    Flux<TeacherSubjectDTO> findSubjectsByUserId(Integer userId);

    @Query("SELECT s.* FROM subjects s " +
            "JOIN teacher_subjects ts ON s.subject_id = ts.subject_id " +
            "WHERE ts.teacher_id = :teacherId")
    Flux<Subject> findSubjectsByTeacherId(Integer teacherId);
}
