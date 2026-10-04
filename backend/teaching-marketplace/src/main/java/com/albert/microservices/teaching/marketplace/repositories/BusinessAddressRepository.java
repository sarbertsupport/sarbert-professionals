package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.BusinessAddress;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface BusinessAddressRepository extends ReactiveCrudRepository<BusinessAddress, Long> {
    
    @Query("SELECT * FROM business_addresses WHERE is_active = true ORDER BY is_default DESC, created_at DESC")
    Flux<BusinessAddress> findAllActive();
    
    @Query("SELECT * FROM business_addresses WHERE is_default = true AND is_active = true LIMIT 1")
    Mono<BusinessAddress> findDefaultAddress();
    
    @Query("SELECT * FROM business_addresses WHERE business_name ILIKE :searchTerm OR contact_person ILIKE :searchTerm OR email ILIKE :searchTerm")
    Flux<BusinessAddress> searchByTerm(@Param("searchTerm") String searchTerm);
    
    @Modifying
    @Query("UPDATE business_addresses SET is_default = false WHERE is_default = true")
    Mono<Integer> clearDefaultFlags();
    
    @Modifying
    @Query("UPDATE business_addresses SET is_default = true WHERE id = :id")
    Mono<Integer> setAsDefault(@Param("id") Long id);
    
    @Modifying
    @Query("UPDATE business_addresses SET is_active = false WHERE id = :id")
    Mono<Integer> deactivateAddress(@Param("id") Long id);
} 