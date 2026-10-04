package com.albert.microservices.teaching.marketplace.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LoggerHelper {
    private static final Logger logger = LoggerFactory.getLogger(LoggerHelper.class);

    public static void logInfo(String transactionId, int responseCode, String responseMessage, String process, long timeTaken, String errorDescription) {
        logger.info("reqId: {} , responseCode: {} , message: {} ,process: {} ,timeTaken: {} ,errorDescription: {}",
                 transactionId, responseCode, responseMessage, process, timeTaken +" ms", errorDescription);
    }

    public static void logError(String transactionId, int responseCode, String responseMessage, String process, long timeTaken, String errorDescription) {
        logger.error("reqId: {} , responseCode: {} , message: {} ,process: {} ,timeTaken: {} ,errorDescription: {}",
                transactionId, responseCode, responseMessage, process, timeTaken +" ms", errorDescription);
    }
}
