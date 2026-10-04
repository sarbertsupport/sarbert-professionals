package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.Availability;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.AvailabilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class AvailabilityController {
    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PostMapping("/availabilities")
    public Mono<ResponseEntity<ApiResponse>> createAvailability(@RequestBody @Valid Availability availability) {
        return availabilityService.createAvailability(availability)
                .map(apiResponse -> new ResponseEntity<>(apiResponse, HttpStatus.valueOf(apiResponse.getHeaders().getResponseCode())));
    }

    @GetMapping("/availabilities")
    public Mono<ResponseEntity<ApiResponse>> getAllAvailabilities() {
        return availabilityService.getAllAvailabilities()
                .map(apiResponse -> new ResponseEntity<>(apiResponse, HttpStatus.valueOf(apiResponse.getHeaders().getResponseCode())));
    }
    @PutMapping("/availabilities/{id}")
    public Mono<ResponseEntity<ApiResponse>> updateAvailability(@PathVariable Integer id, @RequestBody Availability updatedAvailability) {
        return availabilityService.updateAvailability(id, updatedAvailability)
                .map(apiResponse -> new ResponseEntity<>(apiResponse, HttpStatus.valueOf(apiResponse.getHeaders().getResponseCode())));
    }
}
