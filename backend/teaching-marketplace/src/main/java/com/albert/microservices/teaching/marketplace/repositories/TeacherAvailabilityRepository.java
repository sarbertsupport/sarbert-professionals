package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.Availability;
import com.albert.microservices.teaching.marketplace.entities.TeacherAvailability;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface TeacherAvailabilityRepository extends ReactiveCrudRepository<TeacherAvailability, Integer> {
    @Query("SELECT a.* FROM availability a " +
            "JOIN teacher_availability ta ON a.availability_id = ta.availability_id " +
            "WHERE ta.teacher_id = :teacherId")
    Flux<Availability> findAvailabilitiesByTeacherId(Integer teacherId);
}
