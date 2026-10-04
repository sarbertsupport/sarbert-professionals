package com.albert.microservices.teaching.marketplace.exception;

import com.albert.microservices.teaching.marketplace.utils.ResponseBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Autowired
    private ResponseBuilder responseBuilder;

    @ExceptionHandler(CustomAuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleCustomAuthenticationException(CustomAuthenticationException ex) {
        Map<String, Object> errorResponse = responseBuilder.buildErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                ex.getResponseMessage(),
                ex.getCustomerMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(WebExchangeBindException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("Validation failed");

        log.debug("Validation failed: {}", errorMessage);

        Map<String, Object> errorResponse = responseBuilder.buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                errorMessage,
                null
        );

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Covers status errors that are not converted inside controller {@code onErrorResume} (e.g. from filters or infrastructure).
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        int code = status != null ? status.value() : ex.getStatusCode().value();
        String reason = ex.getReason() != null ? ex.getReason() : "Request failed";
        log.warn("HTTP {} — {}", code, reason);
        Map<String, Object> errorResponse = responseBuilder.buildErrorResponse(
                code,
                reason,
                reason,
                null
        );
        return ResponseEntity.status(code).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        log.error("Unhandled exception ({}) — {}", ex.getClass().getName(), ex.getMessage(), ex);
        Map<String, Object> errorResponse = responseBuilder.buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Something went wrong. Please try again later.",
                null
        );
        return ResponseEntity.internalServerError().body(errorResponse);
    }
}