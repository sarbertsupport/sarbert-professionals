package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.StudentProfile;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
@Repository
public interface StudentProfileRepository extends ReactiveCrudRepository<StudentProfile, Integer> {
    @Query("SELECT * FROM student_profiles WHERE user_id = :userId")
    Mono<StudentProfile> findByUserId(Integer userId);

    @Query("SELECT * FROM student_profiles WHERE phone_number = :phoneNumber")
    Mono<StudentProfile> findByPhoneNumber(String phoneNumber);
    @Query("SELECT * FROM student_profiles ORDER BY created_at DESC")
    Flux<StudentProfile> findAllByOrderByCreatedAtDesc();
    @Query("SELECT * FROM student_profiles " +
            "WHERE (:fullName IS NULL OR full_name ILIKE '%' || :fullName || '%') " +
            "AND (:gender IS NULL OR gender = :gender) " +
            "ORDER BY created_at DESC")
    Flux<StudentProfile> findByFilters(String fullName, String gender);

    @Query("SELECT COUNT(*) FROM student_profiles " +
            "WHERE (:fullName IS NULL OR full_name ILIKE '%' || :fullName || '%') " +
            "AND (:gender IS NULL OR gender = :gender)")
    Mono<Long> countByFilters(String fullName, String gender);
}