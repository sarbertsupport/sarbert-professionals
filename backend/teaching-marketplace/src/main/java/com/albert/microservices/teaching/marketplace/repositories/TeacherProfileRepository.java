package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.TeacherProfile;
import com.albert.microservices.teaching.marketplace.requests.TeacherDto;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface TeacherProfileRepository extends ReactiveCrudRepository<TeacherProfile, Integer> {
    Mono<TeacherProfile> findByPhoneNumber(String phoneNumber);

    Mono<TeacherProfile> findByTeacherId(int teacherId);

    Mono<TeacherDto> findByUserId(int userid);

    @Query("Select * from teacher_profiles where user_id=:userId")
    Mono<TeacherProfile> getUserProfile(int userid);

    @Query("SELECT tp.*, td.rate, td.max_fee as maxFee, td.min_fee as minFee " +
            "FROM teacher_profiles tp " +
            "JOIN teaching_details td ON tp.teacher_id = td.teacher_id " +
            "WHERE tp.show_clients = true " +  // Add this condition
            "AND (:gender IS NULL OR tp.gender = :gender) " +
            "AND (:minFee IS NULL OR td.min_fee >= :minFee) " +
            "AND (:maxFee IS NULL OR td.max_fee <= :maxFee) " +
            "AND (:onlineAvailability IS NULL OR td.online_availability = :onlineAvailability) " +
            "AND (:homeAvailability IS NULL OR td.home_availability = :homeAvailability) " +
            "AND (:subjectId IS NULL OR tp.teacher_id IN " +
            "(SELECT teacher_id FROM teacher_subjects)) " +
            "ORDER BY tp.teacher_id " +
            "LIMIT :size OFFSET :offset")
    Flux<TeacherProfile> findTeachersWithFilters(
            String gender,
            Double minFee,
            Double maxFee,
            Boolean onlineAvailability,
            Boolean homeAvailability,
            Integer subjectId,
            int offset,
            int size);

    @Query("SELECT COUNT(*) FROM teacher_profiles tp " +
            "JOIN teaching_details td ON tp.teacher_id = td.teacher_id " +
            "WHERE tp.show_clients = true " +  // Add this condition
            "AND (:gender IS NULL OR tp.gender = :gender) " +
            "AND (:minFee IS NULL OR td.min_fee >= :minFee) " +
            "AND (:maxFee IS NULL OR td.max_fee <= :maxFee) " +
            "AND (:onlineAvailability IS NULL OR td.online_availability = :onlineAvailability) " +
            "AND (:homeAvailability IS NULL OR td.home_availability = :homeAvailability) " +
            "AND (:subjectId IS NULL OR tp.teacher_id IN " +
            "(SELECT teacher_id FROM teacher_subjects))")
    Mono<Long> countTeachersWithFilters(
            String gender,
            Double minFee,
            Double maxFee,
            Boolean onlineAvailability,
            Boolean homeAvailability,
            Integer subjectId);

    @Query("SELECT COUNT(*) FROM teacher_profiles WHERE LOWER(display_name) LIKE LOWER(CONCAT('%', :displayName, '%'))")
    Mono<Long> countByDisplayNameContainingIgnoreCase(String displayName);

    @Query("SELECT * FROM teacher_profiles WHERE LOWER(display_name) LIKE LOWER(CONCAT('%', :displayName, '%'))")
    Flux<TeacherProfile> findByDisplayNameContainingIgnoreCase(String displayName);
}

