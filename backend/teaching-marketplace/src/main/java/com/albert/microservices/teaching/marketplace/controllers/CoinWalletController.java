package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.entities.CoinTransaction;
import com.albert.microservices.teaching.marketplace.requests.CoinPurchaseRequest;
import com.albert.microservices.teaching.marketplace.requests.DeductCoinsRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.jwt.JwtUtil;
import com.albert.microservices.teaching.marketplace.services.CoinWalletService;
import com.albert.microservices.teaching.marketplace.services.impl.CoinPurchaseReceiptService;
import com.albert.microservices.teaching.marketplace.services.impl.InvoiceEmailService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class CoinWalletController {
    private final CoinWalletService walletService;
    private final InvoiceEmailService invoiceEmailService;
    private final CoinPurchaseReceiptService coinPurchaseReceiptService;
    private final JwtUtil jwtUtil;

    public CoinWalletController(CoinWalletService walletService,
                                 InvoiceEmailService invoiceEmailService,
                                 CoinPurchaseReceiptService coinPurchaseReceiptService,
                                 JwtUtil jwtUtil) {
        this.walletService = walletService;
        this.invoiceEmailService = invoiceEmailService;
        this.coinPurchaseReceiptService = coinPurchaseReceiptService;
        this.jwtUtil = jwtUtil;
    }


    @GetMapping("/account/balance/{userId}")
    public Mono<ResponseEntity<ApiResponse>> getBalance(@PathVariable Integer userId) {
        return walletService.getWalletByUserId(userId)
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse))
                .defaultIfEmpty(ResponseEntity.status(404).body(
                        ApiResponse.createResponse(404, "Wallet not found", "Not Found", null)
                ));
    }

    @GetMapping("/transactions/{userId}")
    public Mono<ResponseEntity<ApiResponse>> getTransactions(@PathVariable Integer userId) {
        return walletService.getUserTransactions(userId)
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse))
                .defaultIfEmpty(ResponseEntity.status(404).body(
                        ApiResponse.createResponse(404, "No transactions found", "Not Found", null)
                ));
    }

    /**
     * PDF receipt for a completed coin purchase (same template as email). User must match JWT.
     */
    @GetMapping(value = "/transactions/{userId}/receipt/{transactionUuid}", produces = MediaType.APPLICATION_PDF_VALUE)
    public Mono<ResponseEntity<byte[]>> getCoinPurchaseReceipt(
            @PathVariable Integer userId,
            @PathVariable String transactionUuid,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        String token = authorizationHeader.substring(7);
        Integer authenticatedUserId = jwtUtil.extractUserId(token);
        if (!userId.equals(authenticatedUserId)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        return coinPurchaseReceiptService.generateReceiptPdf(userId, transactionUuid)
                .map(pdfBytes -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    String safeName = "SkillBridge_Receipt_" + transactionUuid.replaceAll("[^a-zA-Z0-9._-]", "_") + ".pdf";
                    headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + safeName + "\"");
                    return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
                })
                .onErrorResume(ResponseStatusException.class, ex ->
                        Mono.just(ResponseEntity.status(ex.getStatusCode()).build())
                )
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()));
    }
    @GetMapping("/transactions/all")
    public Mono<ResponseEntity<ApiResponse>> getAllTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String transactionUuid,
            @RequestParam(required = false) String entryType,
            @RequestParam(required = false) String paystackPaymentId
    ) {
        // Parse dates as LocalDate (date-only)
        LocalDate parsedStartDate = parseDate(startDate);
        LocalDate parsedEndDate = parseDate(endDate);

        return walletService.getAllTransactions(
                page,
                size,
                parsedStartDate,
                parsedEndDate,
                status,
                email,
                transactionUuid,
                entryType,
                paystackPaymentId
        )
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse))
                .defaultIfEmpty(ResponseEntity.status(404).body(
                        ApiResponse.createResponse(404, "No transactions found", "Not Found", null)
                ));
    }

    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }

        try {
            // Try ISO date format first (yyyy-MM-dd)
            return LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e1) {
            try {
                // If datetime format is provided, extract just the date part
                return LocalDate.parse(dateString.split("T")[0]);
            } catch (Exception e2) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid date format. Use yyyy-MM-dd");
            }
        }
    }
    @GetMapping("/transactions/all/{id}")
    public Mono<ResponseEntity<ApiResponse>> getSingleTransactionById(@PathVariable Long id){
        return walletService.getTransactionById(id)
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode()).body(apiResponse))
                .defaultIfEmpty(ResponseEntity.status(404).body(
                        ApiResponse.createResponse(404, "No transactions found", "Not Found", null)
                ));
    }
    @PostMapping("/buy-coins/{userId}")
    public Mono<ResponseEntity<ApiResponse>> buyCoins(
            @PathVariable Integer userId,
            @RequestBody @Valid CoinPurchaseRequest request,
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {

        String finalIdempotencyKey = Optional.ofNullable(idempotencyKey)
                .filter(key -> !key.isBlank())
                .orElse(UUID.randomUUID().toString());

        String token = authorizationHeader.substring(7);
        String userEmail = jwtUtil.extractUsername(token);
        
        // ADD THIS VALIDATION: Extract user ID from JWT token and validate
        Integer authenticatedUserId = jwtUtil.extractUserId(token); // You'll need to add this method to JwtUtil
        
        // Validate that the userId in the URL matches the authenticated user
        if (!userId.equals(authenticatedUserId)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.createResponse(403, "Access denied", 
                            "You can only purchase coins for your own account", null)));
        }

        return walletService.initiateCoinPurchase(
                userId,
                request.getAmount(),
                request.getCurrency(),
                request.getNumberOfCoins(),
                request.getCardToken(),
                finalIdempotencyKey)
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode())
                        .body(apiResponse))
                .onErrorResume(e -> {
                    return Mono.just(ResponseEntity
                            .badRequest()
                            .body(ApiResponse.createResponse(400, "Payment processing error",
                                    e.getMessage(), null)));
                });
    }
    @PostMapping("/deduct-coins/{userId}")
    public Mono<ResponseEntity<ApiResponse>> deductCoins(
            @PathVariable Integer userId,
            @RequestBody @Valid DeductCoinsRequest request) {

        return walletService.initiateCoinDeduction(
                userId,
                request.getCoins(),
                request.getReason(),
                request.getJobId())
                .map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode())
                        .body(apiResponse))
                .onErrorResume(e -> Mono.just(ResponseEntity
                        .badRequest()
                        .body(ApiResponse.createResponse(400, "Coin deduction error",
                                e.getMessage(), null))));
    }
    @PostMapping("/deduct-coins/{clientUserId}/student/{teacherId}")
    public Mono<ResponseEntity<ApiResponse>> deductCoinsStudents(
            @PathVariable Integer teacherId,
            @PathVariable Integer clientUserId,
            @RequestBody @Valid DeductCoinsRequest request) {

        return walletService.initiateCoinDeductionStudent(
                teacherId,
                clientUserId,
                request.getCoins(),
                request.getReason(),
                request.getJobId()
        ).map(apiResponse -> ResponseEntity.status(apiResponse.getHeaders().getResponseCode())
                .body(apiResponse))
                .onErrorResume(e -> Mono.just(ResponseEntity
                        .badRequest()
                        .body(ApiResponse.createResponse(400, "Coin deduction error",
                                e.getMessage(), null))));
    }
}