package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.albert.microservices.teaching.marketplace.entities.Subject;
import com.albert.microservices.teaching.marketplace.repositories.SubjectRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.SubjectService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class SubjectServiceImpl implements SubjectService {
    private static final Logger logger = LoggerFactory.getLogger(SubjectServiceImpl.class);
    private final SubjectRepository subjectRepository;

    public SubjectServiceImpl(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public Mono<ApiResponse> createSubject(Subject subject) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "createSubject";

        return subjectRepository.findBySubjectName(subject.getSubjectName())
                .flatMap(existingSubject -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, processName, duration,
                            CODE_CONFLICT, "Subject creation conflict",
                            "Subject with the same name already exists",
                            subject.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_CONFLICT,
                            "Subject with the same name already exists",
                            CONFLICT,
                            null));
                })
                .switchIfEmpty(subjectRepository.save(subject)
                        .map(savedSubject -> {
                            long duration = System.currentTimeMillis() - startTime;
                            LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                    CODE_SUCCESS, "Subject created successfully",
                                    subject.toString(), "");
                            return ApiResponse.createResponse(
                                    CODE_SUCCESS,
                                    OPERATION_SUCCESS,
                                    SUCCESS,
                                    savedSubject);
                        })
                        .doOnError(error -> {
                            long duration = System.currentTimeMillis() - startTime;
                            LoggingUtility.logError(logger, transactionId, processName, duration,
                                    500, "Error creating subject",
                                    error.getMessage(),
                                    subject.toString(), null);
                        }));
    }

    @Override
    public Mono<ApiResponse> updateSubject(Integer subjectId, Subject updatedSubject) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "updateSubject";

        return subjectRepository.findById(subjectId)
                .flatMap(existingSubject -> {
                    existingSubject.setSubjectName(updatedSubject.getSubjectName());

                    return subjectRepository.save(existingSubject)
                            .map(savedSubject -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, processName, duration,
                                        CODE_SUCCESS, "Subject updated successfully",
                                        updatedSubject.toString(), "");
                                return ApiResponse.createResponse(
                                        CODE_SUCCESS,
                                        OPERATION_SUCCESS,
                                        SUCCESS,
                                        savedSubject);
                            })
                            .doOnError(error -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logError(logger, transactionId, processName, duration,
                                        500, "Error updating subject",
                                        error.getMessage(),
                                        updatedSubject.toString(), null);
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            CODE_NOT_FOUND, "Subject not found",
                            "Subject with ID " + subjectId + " not found",
                            updatedSubject.toString(), null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_NOT_FOUND,
                            RECORD_NOT_FOUND,
                            NOTFOUND,
                            null));
                }));
    }

    @Override
    public Mono<ApiResponse> getAllSubjects() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "getAllSubjects";

        return subjectRepository.findAll()
                .collectList()
                .map(subjectList -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, processName, duration,
                            CODE_SUCCESS, "Retrieved all subjects",
                            "-", "");
                    return ApiResponse.createResponse(
                            CODE_SUCCESS,
                            OPERATION_SUCCESS,
                            SUCCESS,
                            subjectList);
                })
                .doOnError(error -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, processName, duration,
                            500, "Error retrieving subjects",
                            error.getMessage(), "-", null);
                });
    }
}