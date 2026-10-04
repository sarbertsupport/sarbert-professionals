package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.Subject;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class SubjectController {
    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping("/subjects")
    public Mono<ResponseEntity<ApiResponse>> createSubject(@RequestBody @Valid Subject subject) {
        return subjectService.createSubject(subject)
                .map(apiResponse -> new ResponseEntity<>(apiResponse, HttpStatus.valueOf(apiResponse.getHeaders().getResponseCode())));
    }

    @GetMapping("/subjects/all")
    public Mono<ResponseEntity<ApiResponse>> getAllSubjects() {
        return subjectService.getAllSubjects()
                .map(apiResponse -> new ResponseEntity<>(apiResponse, HttpStatus.valueOf(apiResponse.getHeaders().getResponseCode())));
    }

    @PutMapping("subjects/{id}")
    public Mono<ResponseEntity<ApiResponse>> updateSubject(@PathVariable Integer id, @RequestBody @Valid Subject updatedSubject) {
        return subjectService.updateSubject(id, updatedSubject)
                .map(apiResponse -> new ResponseEntity<>(apiResponse, HttpStatus.valueOf(apiResponse.getHeaders().getResponseCode())));
    }
}
