package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.repositories.TermsRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.TermsService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public class TermsServiceImpl implements TermsService {
    private static final Logger logger = LoggerFactory.getLogger(TermsServiceImpl.class);
    private static final String SERVICE_NAME = "TermsService";

    private final TermsRepository termsRepository;

    public TermsServiceImpl(TermsRepository termsRepository) {
        this.termsRepository = termsRepository;
    }

    @Override
    public Mono<ApiResponse> getLatestTerms() {
        String transactionId = UUID.randomUUID().toString();
        String processName = "getLatestTerms";
        long startTime = System.currentTimeMillis();

        return termsRepository.findLatestTerms()
                .map(terms -> {
                    LoggingUtility.logInfo(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            200,
                            "Latest terms and conditions retrieved successfully",
                            null,
                            terms.toString());

                    return ApiResponse.createResponse(
                            200,
                            "Latest terms and conditions retrieved successfully",
                            "Success",
                            terms
                    );
                })
                .switchIfEmpty(Mono.defer(() -> {
                    LoggingUtility.logWarn(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            404,
                            "No terms and conditions found",
                            "No terms document exists in database",
                            null,
                            null);

                    return Mono.just(ApiResponse.createResponse(
                            404,
                            "No terms and conditions found",
                            "Not Found",
                            null
                    ));
                }))
                .onErrorResume(e -> {
                    LoggingUtility.logError(logger, transactionId, processName,
                            System.currentTimeMillis() - startTime,
                            500,
                            "Error retrieving terms and conditions",
                            e.getMessage(),
                            null,
                            null);

                    return Mono.just(ApiResponse.createResponse(
                            500,
                            "Error retrieving terms and conditions",
                            "Internal Server Error",
                            null
                    ));
                });
    }
}