package com.albert.microservices.teaching.marketplace.repositories;
import com.albert.microservices.teaching.marketplace.entities.Availability;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface AvailabilityRepository extends ReactiveCrudRepository<Availability, Integer> {
    Mono<Availability> findByAvailabilityName(String availabilityName);
}
