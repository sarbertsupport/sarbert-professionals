package com.albert.microservices.teaching.marketplace.utils;

import org.slf4j.Logger;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class LoggingUtility {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static void logInfo(Logger logger, String transactionId, String processName,
                               Long duration, int responseCode, String responseMessage,
                               String requestPayload, String responsePayload) {
        logger.info("timestamp: {} , level: {} , reqId: {} , process: {} , timeTaken: {} , responseCode: {} , message: {} , errorDescription: {} , requestPayload: {} , responsePayload: {}",
                LocalDateTime.now().format(DATE_FORMAT),
                "INFO",
                transactionId,
                processName,
                duration != null ? duration + " ms" : "-",
                responseCode,
                responseMessage != null ? responseMessage : "-",
                "-", // Error description
                requestPayload != null ? requestPayload : "-",
                responsePayload != null ? responsePayload : "-");
    }

    public static void logWarn(Logger logger, String transactionId, String processName,
                               Long duration, int responseCode, String responseMessage,
                               String errorDescription, String requestPayload, String responsePayload) {
        logger.warn("timestamp: {} , level: {} , reqId: {} , process: {} , timeTaken: {} , responseCode: {} , message: {} , errorDescription: {} , requestPayload: {} , responsePayload: {}",
                LocalDateTime.now().format(DATE_FORMAT),
                "WARN",
                transactionId,
                processName,
                duration != null ? duration + " ms" : "-",
                responseCode,
                responseMessage != null ? responseMessage : "-",
                errorDescription != null ? errorDescription : "-",
                requestPayload != null ? requestPayload : "-",
                responsePayload != null ? responsePayload : "-");
    }

    public static void logError(Logger logger, String transactionId, String processName,
                                Long duration, int responseCode, String responseMessage,
                                String errorDescription, String requestPayload, String responsePayload) {
        logger.error("timestamp: {} , level: {} , reqId: {} , process: {} , timeTaken: {} , responseCode: {} , message: {} , errorDescription: {} , requestPayload: {} , responsePayload: {}",
                LocalDateTime.now().format(DATE_FORMAT),
                "ERROR",
                transactionId,
                processName,
                duration != null ? duration + " ms" : "-",
                responseCode,
                responseMessage != null ? responseMessage : "-",
                errorDescription != null ? errorDescription : "-",
                requestPayload != null ? requestPayload : "-",
                responsePayload != null ? responsePayload : "-");
    }
}