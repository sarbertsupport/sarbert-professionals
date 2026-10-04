package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.TeacherSubject;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TeacherSubjectService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1")
public class TeacherSubjectController {
    private final TeacherSubjectService teacherSubjectService;

    public TeacherSubjectController(TeacherSubjectService teacherSubjectService) {
        this.teacherSubjectService = teacherSubjectService;
    }

    @PostMapping("/teachers/subjects")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse> createTeacherSubject(@RequestBody TeacherSubject teacherSubject) {
        return teacherSubjectService.createTeacherSubject(teacherSubject);
    }
    @PutMapping("/teachers/subjects/{teacherId}")
    public Mono<ApiResponse> updateTeacherSubjects(@PathVariable Integer teacherId,
                                                   @RequestBody TeacherSubject teacherSubject) {
        return teacherSubjectService.updateTeacherSubject(teacherId, teacherSubject);
    }
    @GetMapping("/teachers/subjects/{userId}")
    public Mono<ApiResponse> getSubjectsByUserId(@PathVariable Integer userId) {
        return teacherSubjectService.getTeacherSubjectsByUserId(userId);
    }
}
