package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.*;
import com.albert.microservices.teaching.marketplace.repositories.*;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.CoinWalletService;
import com.albert.microservices.teaching.marketplace.services.MpesaService;
import com.albert.microservices.teaching.marketplace.services.PaystackService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;
import org.springframework.beans.factory.annotation.Value;

@Service
public class CoinWalletServiceImpl implements CoinWalletService {
    private static final Logger logger = LoggerFactory.getLogger(CoinWalletServiceImpl.class);
    private final CoinWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;
    private final PaystackService paystackService;
    private final BillingAddressRepository billingAddressRepository;
    private final JobApplicantRepository jobApplicantRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final UserRepository userRepository;
    private final PricingRepository pricingRepository;
    private final BulkDiscountRepository bulkDiscountRepository;
    private final MpesaService mpesaService;

    @Value("${paystack.callback.url}")
    private String paystackCallbackUrl;

    public CoinWalletServiceImpl(CoinWalletRepository walletRepository, CoinTransactionRepository transactionRepository, PaystackService paystackService, BillingAddressRepository billingAddressRepository, JobApplicantRepository jobApplicantRepository, TeacherProfileRepository teacherProfileRepository, UserRepository userRepository, PricingRepository pricingRepository, BulkDiscountRepository bulkDiscountRepository, MpesaService mpesaService) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.paystackService = paystackService;
        this.billingAddressRepository = billingAddressRepository;
        this.jobApplicantRepository = jobApplicantRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.userRepository = userRepository;
        this.pricingRepository = pricingRepository;
        this.bulkDiscountRepository = bulkDiscountRepository;
        this.mpesaService = mpesaService;
    }


    public Mono<ApiResponse> getWalletByUserId(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        return walletRepository.findByUserId(userId)
                .switchIfEmpty(
                        walletRepository.save(new CoinWallet(userId, 0.0))
                )
                .map(wallet -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(200, "Wallet retrieved successfully", "Success", wallet);
                    if (logger.isDebugEnabled()) {
                        logger.debug("getWalletByUserId ok userId={} reqId={} {}ms", userId, transactionId, duration);
                    }
                    return response;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getWalletByUserId",
                            duration, CODE_NOT_FOUND, "Error retrieving wallet",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(404, "Error retrieving wallet", e.getMessage(), null));
                });
    }

    public Mono<ApiResponse> getUserTransactions(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .collectList()
                .map(transactions -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(200, "Transactions retrieved successfully", "Success", transactions);
                    if (logger.isDebugEnabled()) {
                        logger.debug("getUserTransactions ok userId={} count={} reqId={} {}ms",
                                userId, transactions.size(), transactionId, duration);
                    }
                    return response;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getUserTransactions",
                            duration, CODE_SERVER_ERROR, "Error retrieving transactions",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500, "Error retrieving transactions", e.getMessage(), null));
                });
    }

    @Override
    public     Mono<ApiResponse> getAllTransactions(int page, int size,
                                         LocalDate startDate, LocalDate endDate,
                                         String status, String email, String transactionUuid,
                                         String entryType, String paystackPaymentId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("page=%d, size=%d, startDate=%s, endDate=%s, status=%s, email=%s, transactionUuid=%s, entryType=%s, paystackPaymentId=%s",
                page, size, startDate, endDate, status, email, transactionUuid, entryType, paystackPaymentId);

        LoggingUtility.logInfo(logger, transactionId, "getAllTransactions",
                null, 200, null, requestPayload, null);

        // Validate page and size (page starts from 1)
        if (page < 1) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "getAllTransactions",
                    duration, CODE_VALIDATION, "Page number must be greater than 0",
                    "Bad Request", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(400, "Page number must be greater than 0", "Bad Request", null));
        }
        if (size < 1) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "getAllTransactions",
                    duration, CODE_VALIDATION, "Page size must be greater than 0",
                    "Bad Request", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(400, "Page size must be greater than 0", "Bad Request", null));
        }

        // concatMap preserves source order (newest first). flatMap merges async and scrambles order,
        // so pagination could hide recent rows (e.g. M-Pesa) from the expected pages.
        return transactionRepository.findAllByOrderByCreatedAtDesc()
                .concatMap(transaction -> {
                    // Get user email
                    Mono<String> userEmailMono = userRepository.findById(transaction.getUserId())
                            .map(User::getEmail)
                            .defaultIfEmpty("Unknown");

                    // Only fetch pricing and discounts if we need to calculate the amount
                    Mono<Map<String, Object>> amountCalculationMono;

                    if (transaction.getAmount() == null || transaction.getAmount() == 0) {
                        // Get base price
                        Mono<BigDecimal> basePriceMono = pricingRepository.findAll().take(1).single()
                                .map(Pricing::getBasePricePerCoin)
                                .defaultIfEmpty(BigDecimal.ZERO);

                        // Get applicable discount
                        Mono<BigDecimal> discountMono = bulkDiscountRepository.findAll()
                                .filter(discount -> discount.getActive() && transaction.getCoins() >= discount.getMinCoins())
                                .reduce((d1, d2) -> d1.getDiscountPercentage().compareTo(d2.getDiscountPercentage()) > 0 ? d1 : d2)
                                .map(BulkDiscount::getDiscountPercentage)
                                .defaultIfEmpty(BigDecimal.ZERO);

                        amountCalculationMono = Mono.zip(basePriceMono, discountMono)
                                .map(tuple -> {
                                    BigDecimal basePrice = tuple.getT1();
                                    BigDecimal discountPercentage = tuple.getT2();

                                    // Calculate final amount
                                    BigDecimal coins = BigDecimal.valueOf(transaction.getCoins());
                                    BigDecimal originalAmount = basePrice.multiply(coins);
                                    BigDecimal discountAmount = originalAmount.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
                                    BigDecimal finalAmount = originalAmount.subtract(discountAmount);

                                    // If entryType is CREDIT, make the amount negative
                                    if ("CREDIT".equalsIgnoreCase(transaction.getEntryType())) {
                                        originalAmount = originalAmount.negate();
                                        finalAmount = finalAmount.negate();
                                    }

                                    Map<String, Object> amountInfo = new HashMap<>();
                                    amountInfo.put("originalAmount", originalAmount.doubleValue());
                                    amountInfo.put("discountPercentage", discountPercentage.doubleValue());
                                    amountInfo.put("finalAmount", finalAmount.doubleValue());
                                    return amountInfo;
                                });
                    } else {
                        // Use existing amount values, but negate if CREDIT
                        double amount = transaction.getAmount();
                        if ("CREDIT".equalsIgnoreCase(transaction.getEntryType())) {
                            amount = -amount;
                        }

                        Map<String, Object> amountInfo = new HashMap<>();
                        amountInfo.put("originalAmount", amount);
                        amountInfo.put("discountPercentage", 0);
                        amountInfo.put("finalAmount", amount);
                        amountCalculationMono = Mono.just(amountInfo);
                    }

                    return Mono.zip(userEmailMono, amountCalculationMono)
                            .map(tuple -> {
                                String userEmail = tuple.getT1();
                                Map<String, Object> amountInfo = tuple.getT2();

                                // Create enhanced transaction info
                                Map<String, Object> enhancedTransaction = new HashMap<>();
                                enhancedTransaction.put("id", transaction.getId());
                                enhancedTransaction.put("email", userEmail);
                                enhancedTransaction.put("transactionUuid", transaction.getTransactionUuid());
                                enhancedTransaction.put("originalAmount", amountInfo.get("originalAmount"));
                                enhancedTransaction.put("discountPercentage", amountInfo.get("discountPercentage"));
                                enhancedTransaction.put("finalAmount", amountInfo.get("finalAmount"));
                                enhancedTransaction.put("currency", transaction.getCurrency());
                                enhancedTransaction.put("stripePaymentId", transaction.getStripePaymentId());
                                enhancedTransaction.put("description", transaction.getDescription());
                                enhancedTransaction.put("status", transaction.getStatus());
                                enhancedTransaction.put("createdAt", transaction.getCreatedAt());
                                enhancedTransaction.put("updatedAt", transaction.getUpdatedAt());
                                enhancedTransaction.put("coins", transaction.getCoins());
                                enhancedTransaction.put("entryType", transaction.getEntryType());
                                enhancedTransaction.put("notes", transaction.getNotes());
                                enhancedTransaction.put("paymentMethod", transaction.getPaymentMethod());
                                enhancedTransaction.put("paystackReference", transaction.getPaystackReference());
                                enhancedTransaction.put("mpesaReceiptNumber", transaction.getMpesaReceiptNumber());
                                enhancedTransaction.put("mpesaPhoneNumber", transaction.getMpesaPhoneNumber());
                                enhancedTransaction.put("mpesaCheckoutRequestId", transaction.getMpesaCheckoutRequestId());
                                enhancedTransaction.put("mpesaMerchantRequestId", transaction.getMpesaMerchantRequestId());
                                enhancedTransaction.put("mpesaResultCode", transaction.getMpesaResultCode());
                                enhancedTransaction.put("mpesaResultDesc", transaction.getMpesaResultDesc());
                                enhancedTransaction.put("mpesaLastStkQueryAt", transaction.getMpesaLastStkQueryAt());
                                enhancedTransaction.put("mpesaStkQueryResponse", transaction.getMpesaStkQueryResponse());
                                enhancedTransaction.put("callbackResponse", transaction.getCallbackResponse());

                                return enhancedTransaction;
                            });
                })
                .collectList()
                .flatMap(allEnhancedTransactions -> {
                    // Apply filters
                    List<Map<String, Object>> filteredTransactions = allEnhancedTransactions.stream()
                            .filter(transaction -> {
                                // Date range filter (date only)
                                if (startDate != null && endDate != null) {
                                    LocalDateTime createdAt = (LocalDateTime) transaction.get("createdAt");
                                    if (createdAt == null) {
                                        return false;
                                    }
                                    LocalDate transactionDate = createdAt.toLocalDate();
                                    if (transactionDate.isBefore(startDate) || transactionDate.isAfter(endDate)) {
                                        return false;
                                    }
                                }

                                // Status filter
                                if (status != null && !status.isEmpty()) {
                                    String transactionStatus = (String) transaction.get("status");
                                    if (transactionStatus == null || !transactionStatus.equalsIgnoreCase(status)) {
                                        return false;
                                    }
                                }

                                // Email filter
                                if (email != null && !email.isEmpty()) {
                                    String transactionEmail = (String) transaction.get("email");
                                    if (transactionEmail == null || !transactionEmail.toLowerCase().contains(email.toLowerCase())) {
                                        return false;
                                    }
                                }

                                // Transaction identifier filter: UUID, numeric DB id, or M-Pesa checkout id
                                if (transactionUuid != null && !transactionUuid.isEmpty()) {
                                    String needle = transactionUuid.trim();
                                    String uuid = (String) transaction.get("transactionUuid");
                                    boolean matchesUuid = uuid != null && uuid.equalsIgnoreCase(needle);
                                    boolean matchesId = false;
                                    if (needle.matches("^\\d+$")) {
                                        try {
                                            long tid = Long.parseLong(needle);
                                            Object idObj = transaction.get("id");
                                            if (idObj instanceof Number && ((Number) idObj).longValue() == tid) {
                                                matchesId = true;
                                            }
                                        } catch (NumberFormatException ignored) {
                                            // unreachable for valid \\d+ needle
                                        }
                                    }
                                    String checkoutId = (String) transaction.get("mpesaCheckoutRequestId");
                                    boolean matchesCheckout = checkoutId != null && checkoutId.equals(needle);
                                    if (!matchesUuid && !matchesId && !matchesCheckout) {
                                        return false;
                                    }
                                }

                                // Entry type filter
                                if (entryType != null && !entryType.isEmpty()) {
                                    String transactionEntryType = (String) transaction.get("entryType");
                                    if (transactionEntryType == null || !transactionEntryType.equalsIgnoreCase(entryType)) {
                                        return false;
                                    }
                                }

                                // Payment reference filter (Paystack id/ref or M-Pesa STK ids — not only stripePaymentId)
                                if (paystackPaymentId != null && !paystackPaymentId.isEmpty()) {
                                    String needle = paystackPaymentId.trim();
                                    if (!matchesAnyPaymentReference(needle, transaction)) {
                                        return false;
                                    }
                                }

                                return true;
                            })
                            .collect(Collectors.toList());

                    // Calculate pagination
                    int totalItems = filteredTransactions.size();
                    int totalPages = (int) Math.ceil((double) totalItems / size);

                    // Validate requested page
                    if (page > totalPages && totalPages > 0) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "getAllTransactions",
                                duration, CODE_VALIDATION, "Requested page exceeds total pages",
                                "Bad Request", requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(400,
                                "Requested page exceeds total pages. Max page is " + totalPages,
                                "Bad Request",
                                null));
                    }

                    // Apply pagination
                    int fromIndex = (page - 1) * size;
                    int toIndex = Math.min(fromIndex + size, totalItems);
                    List<Map<String, Object>> pagedTransactions = filteredTransactions.subList(fromIndex, toIndex);

                    // Create response with pagination metadata
                    Map<String, Object> responseData = new HashMap<>();
                    responseData.put("transactions", pagedTransactions);
                    responseData.put("currentPage", page);
                    responseData.put("totalItems", totalItems);
                    responseData.put("totalPages", totalPages);

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getAllTransactions",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return Mono.just(ApiResponse.createResponse(200,
                            "Transactions retrieved successfully",
                            "Success",
                            responseData));
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getAllTransactions",
                            duration, CODE_SERVER_ERROR, "Error retrieving transactions",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500,
                            "Error retrieving transactions",
                            e.getMessage(),
                            null));
                });
    }

    private static boolean matchesAnyPaymentReference(String needle, Map<String, Object> transaction) {
        String stripe = (String) transaction.get("stripePaymentId");
        if (stripe != null && stripe.equals(needle)) {
            return true;
        }
        String paystackRef = (String) transaction.get("paystackReference");
        if (paystackRef != null && paystackRef.equals(needle)) {
            return true;
        }
        String checkout = (String) transaction.get("mpesaCheckoutRequestId");
        if (checkout != null && checkout.equals(needle)) {
            return true;
        }
        String merchant = (String) transaction.get("mpesaMerchantRequestId");
        if (merchant != null && merchant.equals(needle)) {
            return true;
        }
        String receipt = (String) transaction.get("mpesaReceiptNumber");
        return receipt != null && receipt.equals(needle);
    }

    @Override
    public Mono<ApiResponse> getTransactionById(Long id) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "id=" + id;

        LoggingUtility.logInfo(logger, transactionId, "getTransactionById",
                null, 200, null, requestPayload, null);

        return transactionRepository.findById(id)
                .flatMap(transaction -> {
                    // Get user email
                    Mono<String> userEmailMono = userRepository.findById(transaction.getUserId())
                            .map(User::getEmail)
                            .defaultIfEmpty("Unknown");

                    // Only fetch pricing and discounts if we need to calculate the amount
                    Mono<Map<String, Object>> amountCalculationMono;

                    if (transaction.getAmount() == null || transaction.getAmount() == 0) {
                        // Get base price
                        Mono<BigDecimal> basePriceMono = pricingRepository.findAll().take(1).single()
                                .map(Pricing::getBasePricePerCoin)
                                .defaultIfEmpty(BigDecimal.ZERO);

                        // Get applicable discount
                        Mono<BigDecimal> discountMono = bulkDiscountRepository.findAll()
                                .filter(discount -> discount.getActive() && transaction.getCoins() >= discount.getMinCoins())
                                .reduce((d1, d2) -> d1.getDiscountPercentage().compareTo(d2.getDiscountPercentage()) > 0 ? d1 : d2)
                                .map(BulkDiscount::getDiscountPercentage)
                                .defaultIfEmpty(BigDecimal.ZERO);

                        amountCalculationMono = Mono.zip(basePriceMono, discountMono)
                                .map(tuple -> {
                                    BigDecimal basePrice = tuple.getT1();
                                    BigDecimal discountPercentage = tuple.getT2();

                                    // Calculate final amount
                                    BigDecimal coins = BigDecimal.valueOf(transaction.getCoins());
                                    BigDecimal originalAmount = basePrice.multiply(coins);
                                    BigDecimal discountAmount = originalAmount.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
                                    BigDecimal finalAmount = originalAmount.subtract(discountAmount);

                                    // If entryType is CREDIT, make the amount negative
                                    if ("CREDIT".equalsIgnoreCase(transaction.getEntryType())) {
                                        originalAmount = originalAmount.negate();
                                        finalAmount = finalAmount.negate();
                                    }

                                    Map<String, Object> amountInfo = new HashMap<>();
                                    amountInfo.put("originalAmount", originalAmount.doubleValue());
                                    amountInfo.put("discountPercentage", discountPercentage.doubleValue());
                                    amountInfo.put("finalAmount", finalAmount.doubleValue());
                                    return amountInfo;
                                });
                    } else {
                        // Use existing amount values, but negate if CREDIT
                        double amount = transaction.getAmount();
                        if ("CREDIT".equalsIgnoreCase(transaction.getEntryType())) {
                            amount = -amount;
                        }

                        Map<String, Object> amountInfo = new HashMap<>();
                        amountInfo.put("originalAmount", amount);
                        amountInfo.put("discountPercentage", 0);
                        amountInfo.put("finalAmount", amount);
                        amountCalculationMono = Mono.just(amountInfo);
                    }

                    return Mono.zip(userEmailMono, amountCalculationMono)
                            .map(tuple -> {
                                String email = tuple.getT1();
                                Map<String, Object> amountInfo = tuple.getT2();

                                // Create a DTO or map with the enhanced transaction info
                                Map<String, Object> enhancedTransaction = new HashMap<>();
                                enhancedTransaction.put("id", transaction.getId());
                                enhancedTransaction.put("email", email);
                                enhancedTransaction.put("transactionUuid", transaction.getTransactionUuid());
                                enhancedTransaction.put("originalAmount", amountInfo.get("originalAmount"));
                                enhancedTransaction.put("discountPercentage", amountInfo.get("discountPercentage"));
                                enhancedTransaction.put("finalAmount", amountInfo.get("finalAmount"));
                                enhancedTransaction.put("currency", transaction.getCurrency());
                                enhancedTransaction.put("stripePaymentId", transaction.getStripePaymentId());
                                enhancedTransaction.put("description", transaction.getDescription());
                                enhancedTransaction.put("status", transaction.getStatus());
                                enhancedTransaction.put("createdAt", transaction.getCreatedAt());
                                enhancedTransaction.put("updatedAt", transaction.getUpdatedAt());
                                enhancedTransaction.put("coins", transaction.getCoins());
                                enhancedTransaction.put("entryType", transaction.getEntryType());
                                enhancedTransaction.put("notes", transaction.getNotes());
                                enhancedTransaction.put("paymentMethod", transaction.getPaymentMethod());
                                enhancedTransaction.put("paystackReference", transaction.getPaystackReference());
                                enhancedTransaction.put("mpesaReceiptNumber", transaction.getMpesaReceiptNumber());
                                enhancedTransaction.put("mpesaPhoneNumber", transaction.getMpesaPhoneNumber());
                                enhancedTransaction.put("mpesaCheckoutRequestId", transaction.getMpesaCheckoutRequestId());
                                enhancedTransaction.put("mpesaMerchantRequestId", transaction.getMpesaMerchantRequestId());
                                enhancedTransaction.put("mpesaResultCode", transaction.getMpesaResultCode());
                                enhancedTransaction.put("mpesaResultDesc", transaction.getMpesaResultDesc());
                                enhancedTransaction.put("mpesaLastStkQueryAt", transaction.getMpesaLastStkQueryAt());
                                enhancedTransaction.put("mpesaStkQueryResponse", transaction.getMpesaStkQueryResponse());
                                enhancedTransaction.put("callbackResponse", transaction.getCallbackResponse());

                                return enhancedTransaction;
                            });
                })
                .map(enhancedTransaction -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(200,
                            "Transaction retrieved successfully",
                            "Success",
                            enhancedTransaction);
                    LoggingUtility.logInfo(logger, transactionId, "getTransactionById",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return response;
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "getTransactionById",
                            duration, CODE_NOT_FOUND, "Transaction not found",
                            "Not Found", requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(404,
                            "Transaction not found with id: " + id,
                            "Not Found",
                            null));
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getTransactionById",
                            duration, CODE_SERVER_ERROR, "Error retrieving transaction",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500,
                            "Error retrieving transaction",
                            e.getMessage(),
                            null));
                });
    }


    @Override
    @Transactional
    public Mono<ApiResponse> initiateCoinPurchase(Integer userId, Double amount, String currency,
                                                  int numberOfCoins, String cardToken, String idempotencyKey) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Fast validation
        if (userId == null || amount <= 0 || currency == null || numberOfCoins <= 0) {
            return Mono.just(ApiResponse.createResponse(400, "Invalid parameters", "Validation failed", null));
        }

        // 1. Check idempotency first (non-blocking)
        return transactionRepository.findByIdempotencyKey(idempotencyKey)
                .flatMap(existingTx -> {
                    if ("COMPLETED".equals(existingTx.getStatus())) {
                        return Mono.just(ApiResponse.createResponse(200, "Transaction already completed", "Success", existingTx));
                    }
                    return processTransaction(userId, amount, currency, numberOfCoins, cardToken, idempotencyKey);
                })
                .switchIfEmpty(processTransaction(userId, amount, currency, numberOfCoins, cardToken, idempotencyKey))
                .timeout(Duration.ofSeconds(8))
                .onErrorResume(e -> handleError(e, "initiateCoinPurchase", transactionId, startTime));
    }

    private Mono<ApiResponse> processTransaction(Integer userId, Double amount, String currency,
                                                 int numberOfCoins, String cardToken, String idempotencyKey) {
        // Create transaction record
        CoinTransaction transaction = new CoinTransaction();
        transaction.setUserId(userId);
        transaction.setAmount(amount);
        transaction.setCurrency(currency);
        transaction.setStatus("PENDING");
        transaction.setCoins(numberOfCoins);
        transaction.setDescription("Purchase of " + numberOfCoins + " coins");
        transaction.setEntryType("DEBIT");
        transaction.setPaymentMethod("CARD");
        transaction.setIdempotencyKey(idempotencyKey);
        
        // Generate a unique reference for Paystack
        String paystackReference = "coin_purchase_" + System.currentTimeMillis();
        transaction.setPaystackReference(paystackReference);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("userId", userId.toString());
        metadata.put("transactionType", "COIN_PURCHASE");
        metadata.put("idempotencyKey", idempotencyKey);

        return transactionRepository.save(transaction)
                .flatMap(savedTx -> {
                    metadata.put("transactionUuid", savedTx.getTransactionUuid());

                // Get user email for Paystack
                return userRepository.findById(userId)
                        .flatMap(user -> {
                            // Initialize the transaction with Paystack
                            return paystackService.initializeTransaction(
                                    amount,
                                    currency,
                                    "Purchase of " + numberOfCoins + " coins",
                                    metadata,
                                    user.getEmail(),
                                    paystackReference,
                                    paystackCallbackUrl // Use the configured callback URL
                            ).flatMap(paystackResponse -> {
                                // Check if Paystack initialization was successful
                                Boolean paystackStatus = (Boolean) paystackResponse.get("status");
                                if (paystackStatus != null && paystackStatus) {
                                    Map<String, Object> paystackData = (Map<String, Object>) paystackResponse.get("data");
                                    String authorizationUrl = (String) paystackData.get("authorization_url");
                                    
                                    // CRITICAL FIX: Use the actual Paystack reference, not our custom one
                                    String actualPaystackReference = (String) paystackData.get("reference");
                                    
                                    // Update transaction with the ACTUAL Paystack reference
                                    savedTx.setPaystackReference(actualPaystackReference); // Use Paystack's reference
                                    savedTx.setCallbackResponse(paystackResponse.toString());
                                    savedTx.setStatus("INITIALIZED"); // New status to indicate Paystack initialization
                                    
                                    return transactionRepository.save(savedTx)
                                            .map(updatedTx -> {
                                                // Return the authorization URL to the frontend
                                                Map<String, Object> responseData = new HashMap<>();
                                                responseData.put("transaction", updatedTx);
                                                responseData.put("authorizationUrl", authorizationUrl);
                                                responseData.put("reference", actualPaystackReference); // Return actual Paystack reference
                                                
                                                return ApiResponse.createResponse(200, 
                                                    "Transaction initialized successfully", 
                                                    "Success", 
                                                    responseData);
                                            });
                                } else {
                                    // Paystack initialization failed
                                    String errorMessage = (String) paystackResponse.get("message");
                                    savedTx.setStatus("FAILED");
                                    savedTx.setNotes("Paystack initialization failed: " + errorMessage);
                                    
                                    return transactionRepository.save(savedTx)
                                            .map(failedTx -> ApiResponse.createResponse(400,
                                                "Failed to initialize payment",
                                                errorMessage,
                                                failedTx));
                                }
                            });
                        })
                        .switchIfEmpty(Mono.just(ApiResponse.createResponse(404,
                            "User not found",
                            "User not found",
                            null)));
                });
    }

    /**
     * Background payment monitoring - waits for payment completion and processes it
     * This is different from charging the card - it monitors the payment status
     */
    private void startPaymentMonitoring(CoinTransaction transaction, Double amount, String currency,
                                       int numberOfCoins, String cardToken,
                                       String idempotencyKey, Map<String, String> metadata) {
        
        // Start a background process that monitors the payment
        // This will be triggered when the user returns from Paystack
        Mono.defer(() -> {
            logger.info("Starting payment monitoring for transaction: {}", transaction.getTransactionUuid());
            
            // The actual payment processing will happen when verifyAndCompleteTransaction is called
            // This background process just ensures we have the transaction ready
            return Mono.just("Payment monitoring started");
        })
        .subscribeOn(Schedulers.boundedElastic())
        .subscribe(
            result -> logger.info("Payment monitoring started for transaction: {}", transaction.getTransactionUuid()),
            error -> logger.error("Error starting payment monitoring for transaction: {}", transaction.getTransactionUuid(), error)
        );
    }

    /**
     * Enhanced background payment processing - this method can be called to process payments
     * when they're ready (e.g., from webhooks or callbacks)
     */
    public Mono<ApiResponse> processPaymentInBackground(String transactionUuid, String paystackReference) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("transactionUuid: %s, paystackReference: %s", transactionUuid, paystackReference);

        logger.debug("processPaymentInBackground start {}", requestPayload);

        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "processPaymentInBackground",
                            duration, 404, "Transaction not found",
                            "Transaction UUID: " + transactionUuid, requestPayload, null);
                    return Mono.error(new IllegalArgumentException("Transaction not found"));
                }))
                .flatMap(transaction -> paystackService.verifyTransaction(paystackReference)
                        .flatMap(paystackResponse -> {
                            // Store the full callback response for debugging
                            String callbackResponseJson = paystackResponse.toString();

                            // Check the top-level status field first (should be true for successful API call)
                            Boolean apiStatus = (Boolean) paystackResponse.get("status");
                            if (apiStatus != null && apiStatus) {
                                Map<String, Object> data = (Map<String, Object>) paystackResponse.get("data");
                                if (data != null) {
                                    // Check the transaction status field according to Paystack documentation
                                    String transactionStatus = (String) data.get("status");
                                    String gatewayResponse = (String) data.get("gateway_response");

                                    // Update transaction with callback response
                                    transaction.setCallbackResponse(callbackResponseJson);

                                    switch (transactionStatus.toLowerCase()) {
                                        case "success":
                                            // Transaction is successful - complete it
                                            transaction.setNotes("Payment successful");
                                            return completeTransactionWithNotes(transaction.getTransactionUuid(), paystackReference, "Payment successful", callbackResponseJson);

                                        case "failed":
                                            // Transaction failed
                                            String failureReason = gatewayResponse != null ? gatewayResponse : "Payment failed";
                                            transaction.setNotes("Payment failed: " + failureReason);
                                            return markTransactionAsFailedWithNotes(transaction.getTransactionUuid(), "Payment failed: " + failureReason, callbackResponseJson);

                                        case "pending":
                                            // Transaction is still pending - keep it as pending
                                            transaction.setNotes("Payment pending verification");
                                            transaction.setCallbackResponse(callbackResponseJson);
                                            return transactionRepository.save(transaction)
                                                    .map(savedTransaction -> ApiResponse.createResponse(200, "Payment still pending", "Pending", savedTransaction));

                                        case "abandoned":
                                            // Transaction was abandoned by user
                                            transaction.setNotes("Payment abandoned by user");
                                            return markTransactionAsFailedWithNotes(transaction.getTransactionUuid(), "Payment abandoned by user", callbackResponseJson);

                                        case "reversed":
                                            // Transaction was reversed (refunded)
                                            transaction.setNotes("Payment reversed/refunded");
                                            return markTransactionAsFailedWithNotes(transaction.getTransactionUuid(), "Payment reversed/refunded", callbackResponseJson);

                                        default:
                                            // Unknown status
                                            String unknownReason = "Unknown payment status: " + transactionStatus;
                                            transaction.setNotes(unknownReason);
                                            return markTransactionAsFailedWithNotes(transaction.getTransactionUuid(), unknownReason, callbackResponseJson);
                                    }
                                } else {
                                    return markTransactionAsFailedWithNotes(transaction.getTransactionUuid(),
                                            "No transaction data in Paystack response", callbackResponseJson);
                                }
                            } else {
                                // API call failed
                                return markTransactionAsFailedWithNotes(transaction.getTransactionUuid(),
                                        "Paystack API verification failed", callbackResponseJson);
                            }
                        })
                        .onErrorResume(e -> recoverPaystackVerifyHttpFailure(transaction, e))
                )
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (e instanceof IllegalArgumentException && e.getMessage() != null
                            && e.getMessage().contains("Transaction not found")) {
                        return Mono.just(ApiResponse.createResponse(404, e.getMessage(), "Not found", null));
                    }
                    logger.error("processPaymentInBackground unexpected error {}: {}", requestPayload, e.getMessage(), e);
                    return Mono.just(ApiResponse.createResponse(500, "Error processing payment", e.getMessage(), null));
                });
    }

    /**
     * When Paystack verify throws (HTTP error, timeout, etc.), update the row so the scheduler does not
     * retry forever while staying PENDING. Client 4xx from Paystack is treated as terminal (bad reference).
     * Other errors retry up to {@link CoinTransaction#getMaxRetries()} (default 3), then FAILED.
     */
    private Mono<ApiResponse> recoverPaystackVerifyHttpFailure(CoinTransaction transaction, Throwable e) {
        int max = transaction.getMaxRetries() != null ? transaction.getMaxRetries() : 3;
        int prev = transaction.getRetryCount() != null ? transaction.getRetryCount() : 0;
        int attempts = prev + 1;
        transaction.setRetryCount(attempts);
        transaction.setUpdatedAt(LocalDateTime.now());

        boolean clientError = false;
        if (e instanceof WebClientResponseException wre) {
            int sc = wre.getStatusCode().value();
            clientError = sc >= 400 && sc < 500;
        }

        boolean giveUp = clientError || attempts >= max;

        if (giveUp) {
            transaction.setStatus("FAILED");
            String reason = clientError
                    ? "Paystack verify rejected (invalid reference, wrong secret/mode, or charge never created at Paystack)"
                    : "Paystack verify failed after " + attempts + " attempt(s)";
            transaction.setNotes(reason + ": " + e.getMessage());
            logger.warn("Coin transaction {} marked FAILED (paystack ref={}, attempts={}): {}",
                    transaction.getTransactionUuid(), transaction.getPaystackReference(), attempts, e.getMessage());
            return transactionRepository.save(transaction)
                    .map(t -> ApiResponse.createResponse(400, e.getMessage(), "VERIFY_FAILED", t));
        }

        transaction.setNotes("Paystack verify will retry (" + attempts + "/" + max + "): " + e.getMessage());
        logger.debug("Coin transaction {} verify error, retry later {}/{}: {}",
                transaction.getTransactionUuid(), attempts, max, e.getMessage());
        return transactionRepository.save(transaction)
                .map(t -> ApiResponse.createResponse(409, e.getMessage(), "VERIFY_RETRY", t));
    }






    private Mono<ApiResponse> proceedWithPayment(Integer userId, Double amount, String currency,
                                                 int numberOfCoins, String cardToken,
                                                 String idempotencyKey, String transactionId,
                                                 long startTime) {
        CoinTransaction transaction = new CoinTransaction();
        transaction.setUserId(userId);
        transaction.setAmount(amount);
        transaction.setCurrency(currency);
        transaction.setStatus("PENDING");
        transaction.setCoins(numberOfCoins);
        transaction.setDescription("Purchase of " + numberOfCoins + " coins " + "@" + amount + " usd");
        transaction.setEntryType("DEBIT");
        transaction.setPaymentMethod("CARD");
        
        // Set Paystack reference if provided (cardToken is used as reference)
        if (cardToken != null && !cardToken.isEmpty()) {
            transaction.setPaystackReference(cardToken);
        }

        // Store the idempotency key in metadata
        Map<String, String> metadata = new HashMap<>();
        metadata.put("userId", userId.toString());
        metadata.put("transactionType", "COIN_PURCHASE");
        metadata.put("idempotencyKey", idempotencyKey);

        return transactionRepository.save(transaction)
                .flatMap(savedTransaction -> {
                    metadata.put("transactionUuid", savedTransaction.getTransactionUuid());
                    
                    // Return success - payment will be verified when user returns from Paystack
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "proceedWithPayment",
                            duration, CODE_SUCCESS, "Transaction created successfully",
                            "Idempotency key: " + idempotencyKey, "");
                    return Mono.just(ApiResponse.createResponse(200, "Transaction created successfully", "Success", savedTransaction));
                });
    }



    // Optimized completeTransaction with parallel wallet and transaction updates
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Mono<ApiResponse> completeTransaction(String transactionUuid, String paystackPaymentId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("transactionUuid: %s, paystackPaymentId: %s",
                transactionUuid, paystackPaymentId);

        LoggingUtility.logInfo(logger, transactionId, "completeTransaction",
                null, 200, null, requestPayload, null);

        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "completeTransaction",
                            duration, 404, "Transaction not found",
                            "Transaction UUID: " + transactionUuid, requestPayload, null);
                    return Mono.error(new IllegalArgumentException("Transaction not found"));
                }))
                .flatMap(transaction -> {
                    if ("COMPLETED".equals(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "completeTransaction",
                                duration, 200, "Transaction already completed",
                                "Status: COMPLETED", requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(200,
                                "Transaction already completed",
                                "Success",
                                transaction));
                    }

                    transaction.setStripePaymentId(paystackPaymentId);
                    transaction.setPaystackReference(paystackPaymentId); // Set the Paystack reference
                    transaction.setPaymentMethod("CARD");
                    transaction.setStatus("COMPLETED");
                    transaction.setUpdatedAt(LocalDateTime.now());

                    // Parallel execution of wallet update and transaction save
                    Mono<CoinWallet> walletUpdate = walletRepository.findByUserId(transaction.getUserId())
                            .switchIfEmpty(Mono.defer(() -> {
                                LoggingUtility.logInfo(logger, transactionId, "completeTransaction",
                                        System.currentTimeMillis() - startTime, 200,
                                        "Creating new wallet for user",
                                        "User ID: " + transaction.getUserId(), null);
                                return walletRepository.save(new CoinWallet(transaction.getUserId(), 0.0));
                            }))
                            .flatMap(wallet -> {
                                wallet.addCoins(transaction.getCoins());
                                return walletRepository.save(wallet);
                            });

                    Mono<CoinTransaction> transactionSave = transactionRepository.save(transaction);

                    return Mono.zip(walletUpdate, transactionSave)
                            .map(tuple -> {
                                CoinTransaction savedTransaction = tuple.getT2();
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "completeTransaction",
                                        duration, 200, "Transaction completed successfully",
                                        "Transaction ID: " + savedTransaction.getId(), null);
                                return ApiResponse.createResponse(200,
                                        "Transaction completed successfully",
                                        "Success",
                                        savedTransaction);
                            });
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "completeTransaction",
                            duration, 400, "Error completing transaction",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(400,
                            "Error completing transaction",
                            e.getMessage(),
                            null));
                });
    }

    private Mono<ApiResponse> handleError(Throwable e, String methodName, String transactionId, long startTime) {
        String errorMsg = parsePaystackError(e);
        LoggingUtility.logError(logger, transactionId, methodName,
                System.currentTimeMillis() - startTime, 500, "Operation failed",
                errorMsg, null, null);
        return Mono.just(ApiResponse.createResponse(500, "Operation failed", errorMsg, null));
    }

    private Mono<CoinWallet> createNewWallet(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        LoggingUtility.logInfo(logger, transactionId, "createNewWallet",
                null, 200, null, requestPayload, null);

        return walletRepository.save(new CoinWallet(userId, 0.0))
                .map(wallet -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "createNewWallet",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return wallet;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "createNewWallet",
                            duration, CODE_SERVER_ERROR, "Error creating new wallet",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Mono<ApiResponse> failTransaction(String transactionUuid, String reason) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "transactionUuid=" + transactionUuid + ", reason=" + reason;

        LoggingUtility.logInfo(logger, transactionId, "failTransaction",
                null, 200, null, requestPayload, null);

        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Transaction not found")))
                .flatMap(transaction -> {
                    if ("FAILED".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "failTransaction",
                                duration, CODE_CONFLICT, "Transaction already failed",
                                "Conflict", requestPayload,"");
                        return Mono.just(transaction);
                    }

                    if (!"PENDING".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, transactionId, "failTransaction",
                                duration, CODE_VALIDATION, "Transaction in invalid state",
                                transaction.getStatus(), requestPayload, null);
                        return Mono.error(new IllegalStateException(
                                "Transaction in invalid state: " + transaction.getStatus()));
                    }

                    transaction.setStatus("FAILED");
                    transaction.setDescription(reason);
                    transaction.setUpdatedAt(LocalDateTime.now());
                    return transactionRepository.save(transaction);
                })
                .map(transaction -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(200, "Transaction marked as failed", "Success", transaction);
                    LoggingUtility.logInfo(logger, transactionId, "failTransaction",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return response;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "failTransaction",
                            duration, CODE_VALIDATION, "Error failing transaction",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(400, "Error failing transaction", e.getMessage(), null));
                });
    }

    private String parsePaystackError(Throwable e) {
        // Handle Paystack-specific errors
        String errorMessage = e.getMessage();
        if (errorMessage != null) {
            if (errorMessage.contains("card_declined")) {
                return "Your card was declined. Please contact your bank or use a different card.";
            } else if (errorMessage.contains("expired_card")) {
                return "Your card has expired. Please use a different card.";
            } else if (errorMessage.contains("incorrect_cvc")) {
                return "The CVC number is incorrect. Please check your card details.";
            } else if (errorMessage.contains("processing_error")) {
                return "An error occurred while processing your card. Please try again.";
            }
        }
        return "Payment processing failed: " + e.getMessage();
    }
    @Transactional
    public Mono<ApiResponse> initiateCoinDeduction(Integer userId, int coinsToDeduct, String description, Long jobId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("userId=%d, coinsToDeduct=%d, description=%s, jobId=%d",
                userId, coinsToDeduct, description, jobId);

        LoggingUtility.logInfo(logger, transactionId, "initiateCoinDeduction",
                null, 0, "Coin deduction request received", requestPayload, null);

        if (coinsToDeduct <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "initiateCoinDeduction",
                    duration, CODE_VALIDATION, "Invalid coin amount",
                    "Coins to deduct must be positive", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(400, "Invalid coin amount",
                    "Coins to deduct must be positive", null));
        }

        // First check if user has already applied to this job in job_applicants table
        return jobApplicantRepository.existsByJobIdAndApplicantId(jobId, userId.longValue())
                .flatMap(hasApplied -> {
                    if (hasApplied) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "initiateCoinDeduction",
                                duration, CODE_CONFLICT, "Already applied",
                                "You have already applied to this job", requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(409, "Already applied",
                                "You have already applied to this job", null));
                    }

                    // Create transaction record
                    CoinTransaction transaction = new CoinTransaction();
                    transaction.setUserId(userId);
                    transaction.setCoins(coinsToDeduct);
                    transaction.setStatus("COMPLETED");
                    transaction.setDescription(description);
                    transaction.setEntryType("CREDIT");
                    transaction.setPaymentMethod("WALLET");
                    transaction.setAmount(0.0);
                    transaction.setCurrency("USD");

                    return walletRepository.findByUserId(userId)
                            .switchIfEmpty(Mono.error(new IllegalArgumentException("Wallet not found for user: " + userId)))
                            .flatMap(wallet -> {
                                // Check if user has sufficient balance
                                if (wallet.getCoinBalance() < coinsToDeduct) {
                                    long duration = System.currentTimeMillis() - startTime;
                                    LoggingUtility.logWarn(logger, transactionId, "initiateCoinDeduction",
                                            duration, CODE_VALIDATION, "Insufficient coins",
                                            "User doesn't have enough coins to deduct", requestPayload, "");
                                    return Mono.just(ApiResponse.createResponse(400, "Insufficient coins",
                                            "User doesn't have enough coins to deduct", null));
                                }

                                // Deduct coins
                                wallet.deductCoins(coinsToDeduct);

                                // Save wallet, transaction, AND create job applicant record
                                return walletRepository.save(wallet)
                                        .then(transactionRepository.save(transaction))
                                        .then(createJobApplicantRecord(jobId, userId.longValue(), coinsToDeduct))
                                        .map(savedTransaction -> {
                                            long duration = System.currentTimeMillis() - startTime;
                                            ApiResponse response = ApiResponse.createResponse(200,
                                                    "Coins deducted successfully", "Success", savedTransaction);
                                            LoggingUtility.logInfo(logger, transactionId, "initiateCoinDeduction",
                                                    duration, CODE_SUCCESS, OPERATION_SUCCESS,
                                                    null, "");
                                            return response;
                                        });
                            });
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "initiateCoinDeduction",
                            duration, CODE_SERVER_ERROR, "Error deducting coins",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500,
                            "Error deducting coins", e.getMessage(), null));
                });
    }
    @Transactional
    public Mono<ApiResponse> initiateCoinDeductionStudent(Integer teacherId, Integer clientUserId,
                                                          int coinsToDeduct, String description, Long jobId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("teacherId=%d, clientUserId=%d, coinsToDeduct=%d, description=%s, jobId=%d",
                teacherId, clientUserId, coinsToDeduct, description, jobId);

        LoggingUtility.logInfo(logger, transactionId, "initiateCoinDeductionStudent",
                null, 0, "Student coin deduction request received", requestPayload, null);

        if (coinsToDeduct <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "initiateCoinDeductionStudent",
                    duration, 400, "Invalid coin amount",
                    "Coins to deduct must be positive", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(400, "Invalid coin amount",
                    "Coins to deduct must be positive", null));
        }

        return teacherProfileRepository.findByTeacherId(teacherId)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    String errorMsg = "Teacher profile not found for teacherId: " + teacherId;
                    LoggingUtility.logError(logger, transactionId, "initiateCoinDeductionStudent",
                            duration, 404, errorMsg,
                            errorMsg, requestPayload, null);
                    return Mono.error(new IllegalArgumentException(errorMsg));
                }))
                .flatMap(teacherProfile -> {
                    Integer userId = teacherProfile.getUserId();

                    // Check if either userId or clientUserId has applied to this job
                    Mono<Boolean> userHasApplied = jobApplicantRepository.existsByJobIdAndApplicantId(jobId, userId.longValue());
                    Mono<Boolean> clientHasApplied = jobApplicantRepository.existsByJobIdAndApplicantId(jobId, clientUserId.longValue());

                    return Mono.zip(userHasApplied, clientHasApplied)
                            .flatMap(result -> {
                                boolean hasUserApplied = result.getT1();
                                boolean hasClientApplied = result.getT2();

                                if (hasUserApplied || hasClientApplied) {
                                    long duration = System.currentTimeMillis() - startTime;
                                    String warnMsg = "Either the teacher or the student has already applied to this job";
                                    LoggingUtility.logWarn(logger, transactionId, "initiateCoinDeductionStudent",
                                            duration, 409, "Already applied",
                                            warnMsg, requestPayload, null);
                                    return Mono.just(ApiResponse.createResponse(409, "Already applied",
                                            warnMsg, null));
                                }

                                // Proceed with deduction and saving
                                CoinTransaction transaction = new CoinTransaction();
                                transaction.setUserId(clientUserId);
                                transaction.setCoins(coinsToDeduct);
                                transaction.setStatus("COMPLETED");
                                transaction.setDescription(description);
                                transaction.setEntryType("CREDIT");
                                transaction.setPaymentMethod("WALLET");
                                transaction.setAmount(0.0);
                                transaction.setCurrency("USD");

                                return walletRepository.findByUserId(clientUserId)
                                        .switchIfEmpty(Mono.defer(() -> {
                                            long duration = System.currentTimeMillis() - startTime;
                                            String errorMsg = "Wallet not found for user: " + clientUserId;
                                            LoggingUtility.logError(logger, transactionId, "initiateCoinDeductionStudent",
                                                    duration, 404, errorMsg,
                                                    errorMsg, requestPayload, null);
                                            return Mono.error(new IllegalArgumentException(errorMsg));
                                        }))
                                        .flatMap(wallet -> {
                                            if (wallet.getCoinBalance() < coinsToDeduct) {
                                                long duration = System.currentTimeMillis() - startTime;
                                                String warnMsg = "User doesn't have enough coins to deduct";
                                                LoggingUtility.logWarn(logger, transactionId, "initiateCoinDeductionStudent",
                                                        duration, 400, "Insufficient coins",
                                                        warnMsg, requestPayload, null);
                                                return Mono.just(ApiResponse.createResponse(400, "Insufficient coins",
                                                        warnMsg, null));
                                            }

                                            wallet.deductCoins(coinsToDeduct);

                                            return walletRepository.save(wallet)
                                                    .then(transactionRepository.save(transaction))
                                                    .then(createJobApplicantRecord(jobId, Long.valueOf(clientUserId), coinsToDeduct))
                                                    .map(savedTransaction -> {
                                                        long duration = System.currentTimeMillis() - startTime;
                                                        LoggingUtility.logInfo(logger, transactionId, "initiateCoinDeductionStudent",
                                                                duration, 200, "Coins deducted successfully",
                                                                "Success", "");
                                                        return ApiResponse.createResponse(200,
                                                                "Coins deducted successfully", "Success", savedTransaction);
                                                    });
                                        });
                            });
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "initiateCoinDeductionStudent",
                            duration, 500, e.getMessage(),
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500,
                            e.getMessage(), e.getMessage(), null));
                });
    }

    private Mono<JobApplicant> createJobApplicantRecord(Long jobId, Long applicantId, Integer coinsDeducted) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("jobId=%d, applicantId=%d, coinsDeducted=%d",
                jobId, applicantId, coinsDeducted);

        LoggingUtility.logInfo(logger, transactionId, "createJobApplicantRecord",
                null, 200, null, requestPayload, null);

        JobApplicant applicant = new JobApplicant();
        applicant.setJobId(jobId);
        applicant.setApplicantId(applicantId);
        applicant.setAppliedAt(LocalDateTime.now());
        applicant.setCoinsDeducted(coinsDeducted);
        applicant.setStatus("APPLIED");

        return jobApplicantRepository.save(applicant)
                .map(savedApplicant -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "createJobApplicantRecord",
                            duration, 200, "Job applicant record created",
                            "Success", "");
                    return savedApplicant;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "createJobApplicantRecord",
                            duration, 500, e.getMessage(),e.getMessage(),"","");
                    return Mono.error(e);
                });
    }

    private String handleCardDeclined(String declineCode) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "declineCode=" + declineCode;

        LoggingUtility.logInfo(logger, transactionId, "handleCardDeclined",
                null, 200, null, requestPayload, null);

        if (declineCode == null) {
            long duration = System.currentTimeMillis() - startTime;
            String response = "Your card was declined. Please contact your bank.";
            LoggingUtility.logWarn(logger, transactionId, "handleCardDeclined",
                    duration, 400, "Card declined",
                    response, requestPayload, response);
            return response;
        }

        String response;
        switch (declineCode) {
            case "insufficient_funds":
                response = "Your card has insufficient funds.";
                break;
            case "lost_card":
                response = "Your card was reported lost. Please use a different card.";
                break;
            case "stolen_card":
                response = "Your card was reported stolen. Please use a different card.";
                break;
            case "generic_decline":
            case "do_not_honor":
                response = "Your card was declined. Please contact your bank.";
                break;
            case "merchant_blacklist":
                response = "This card is not accepted. Please use a different payment method.";
                break;
            default:
                response = "Your card was declined. Reason: " + declineCode;
        }

        long duration = System.currentTimeMillis() - startTime;
        LoggingUtility.logWarn(logger, transactionId, "handleCardDeclined",
                duration, 400, "Card declined",
                response, requestPayload, response);
        return response;
    }

    public Mono<BillingAddress> getBillingAddressForInvoice(Integer userId) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "userId=" + userId;

        LoggingUtility.logInfo(logger, transactionId, "getBillingAddressForInvoice",
                null, 200, null, requestPayload, null);

        return billingAddressRepository.findByUserId(userId)
                .map(billingAddress -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getBillingAddressForInvoice",
                            duration, 200, "Billing address retrieved",
                            "Success", null);
                    return billingAddress;
                })
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "getBillingAddressForInvoice",
                            duration, 404, "Billing address not found",
                            "Not Found", requestPayload, null);
                    return Mono.empty();
                }))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getBillingAddressForInvoice",
                            duration, 500, "Error retrieving billing address",
                            e.getMessage(), requestPayload, null);
                    return Mono.error(e);
                });
    }
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Mono<ApiResponse> completeMpesaTransaction(String transactionUuid, String mpesaReceiptNumber) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "transactionUuid=" + transactionUuid + ", mpesaReceiptNumber=" + mpesaReceiptNumber;

        LoggingUtility.logInfo(logger, transactionId, "completeMpesaTransaction",
                null, 200, null, requestPayload, null);

        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Transaction not found")))
                .flatMap(transaction -> {
                    if ("COMPLETED".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "completeMpesaTransaction",
                                duration, CODE_CONFLICT, "Transaction already completed",
                                "Conflict", requestPayload, "");
                        return Mono.just(transaction);
                    }

                    if (!"PENDING".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, transactionId, "completeMpesaTransaction",
                                duration, CODE_VALIDATION, "Transaction in invalid state",
                                transaction.getStatus(), requestPayload, null);
                        return Mono.error(new IllegalStateException(
                                "Transaction in invalid state: " + transaction.getStatus()));
                    }

                    transaction.setMpesaReceiptNumber(mpesaReceiptNumber);
                    transaction.setPaymentMethod("MPESA");
                    transaction.setStatus("COMPLETED");
                    transaction.setUpdatedAt(LocalDateTime.now());

                    // Parallel execution of wallet update and transaction save
                    Mono<CoinWallet> walletUpdate = walletRepository.findByUserId(transaction.getUserId())
                            .switchIfEmpty(createNewWallet(transaction.getUserId()))
                            .flatMap(wallet -> {
                                wallet.addCoins(transaction.getCoins());
                                return walletRepository.save(wallet);
                            });

                    Mono<CoinTransaction> transactionSave = transactionRepository.save(transaction);

                    return Mono.zip(walletUpdate, transactionSave)
                            .map(tuple -> tuple.getT2()); // Return the saved transaction
                })
                .map(transaction -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(200, "Transaction completed successfully", "Success", transaction);
                    LoggingUtility.logInfo(logger, transactionId, "completeMpesaTransaction",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return response;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "completeMpesaTransaction",
                            duration, CODE_VALIDATION, "Error completing transaction",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(400, "Error completing transaction", e.getMessage(), null));
                });
    }
    public Mono<ApiResponse> initiateMpesaCoinPurchase(Integer userId, String phoneNumber, Double amount, int coins, String idempotencyKey) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("userId=%d, phoneNumber=%s, amount=%.2f, coins=%d",
                userId, phoneNumber, amount, coins);

        LoggingUtility.logInfo(logger, transactionId, "initiateMpesaCoinPurchase",
                null, 200, null, requestPayload, null);

        if (amount <= 0 || coins <= 0) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "initiateMpesaCoinPurchase",
                    duration, CODE_VALIDATION, "Invalid amount or coins",
                    "Amount and coins must be positive", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(400, "Invalid amount or coins",
                    "Amount and coins must be positive", null));
        }

        return mpesaService.initiateSTKPush(userId, phoneNumber, amount, coins, idempotencyKey)
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "initiateMpesaCoinPurchase",
                            duration, CODE_SERVER_ERROR, "Error initiating M-Pesa payment",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500, "Error initiating payment", e.getMessage(), null));
                });
    }
    @Override
    public Mono<Void> handleMpesaCallback(Map<String, Object> callbackData) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = callbackData.toString();

        LoggingUtility.logInfo(logger, transactionId, "handleMpesaCallback",
                null, 200, null, requestPayload, null);

        return mpesaService.handleMpesaCallback(callbackData)
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "handleMpesaCallback",
                            duration, 500, "Error processing M-Pesa callback",
                            e.getMessage(), requestPayload, null);
                    return Mono.empty();
                });
    }

    @Override
    public Mono<ApiResponse> verifyAndCompleteTransaction(String reference) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "reference=" + reference;

        LoggingUtility.logInfo(logger, transactionId, "verifyAndCompleteTransaction",
                null, 200, "Starting transaction verification", requestPayload, null);

        // First, find the transaction by reference
        return transactionRepository.findByPaystackReference(reference)
                .switchIfEmpty(Mono.defer(() -> {
                    Long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "verifyAndCompleteTransaction",
                            duration, 404, "Transaction not found for reference",
                            "Reference: " + reference, requestPayload, null);
                    return Mono.error(new IllegalArgumentException("Transaction not found for reference: " + reference));
                }))
                .flatMap(transaction -> {
                    // If already completed, return success
                    if ("COMPLETED".equals(transaction.getStatus())) {
                        Long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "verifyAndCompleteTransaction",
                            duration, 200, "Transaction already completed",
                            requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(200, "Transaction already completed", "Success", transaction));
                    }

                    // Handle FAILED transactions with retry logic
                    if ("FAILED".equals(transaction.getStatus())) {
                        // Check if we've exceeded max retries
                        if (transaction.getRetryCount() >= transaction.getMaxRetries()) {
                            Long duration = System.currentTimeMillis() - startTime;
                            LoggingUtility.logWarn(logger, transactionId, "verifyAndCompleteTransaction",
                                    duration, 400, "Transaction permanently failed - max retries exceeded",
                                    String.format("Retry Count: %d/%d", transaction.getRetryCount(), transaction.getMaxRetries()), requestPayload, null);
                            return Mono.just(ApiResponse.createResponse(400, "Transaction permanently failed - max retries exceeded", "Permanently Failed", transaction));
                        }
                        
                        // Increment retry count and log the retry attempt
                        transaction.setRetryCount(transaction.getRetryCount() + 1);
                        transaction.setUpdatedAt(LocalDateTime.now());
                        
                        Long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "verifyAndCompleteTransaction",
                                duration, 200, "Retrying failed transaction",
                                String.format("Retry Attempt: %d/%d", transaction.getRetryCount(), transaction.getMaxRetries()), requestPayload);
                        
                        // Save the updated retry count
                        return transactionRepository.save(transaction)
                                .flatMap(updatedTransaction -> {
                                    // Continue to verify with Paystack
                                    return processPaymentInBackground(updatedTransaction.getTransactionUuid(), reference);
                                });
                    }

                    // Handle INITIALIZED status - these are transactions that were initialized with Paystack
                    if ("INITIALIZED".equals(transaction.getStatus())) {
                        Long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "verifyAndCompleteTransaction",
                                duration, 200, "Processing INITIALIZED transaction",
                                "Status: INITIALIZED", requestPayload);
                        
                        // Use enhanced background processing to handle the payment
                        return processPaymentInBackground(transaction.getTransactionUuid(), reference);
                    }

                    // Handle PENDING status (legacy)
                    if ("PENDING".equals(transaction.getStatus())) {
                        Long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "verifyAndCompleteTransaction",
                                duration, 200, "Processing PENDING transaction",
                                "Status: PENDING", requestPayload);
                        
                        // Use enhanced background processing to handle the payment
                        return processPaymentInBackground(transaction.getTransactionUuid(), reference);
                    }

                    // If status is neither COMPLETED, FAILED, INITIALIZED, nor PENDING, return error
                    Long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "verifyAndCompleteTransaction",
                            duration, 400, "Transaction in invalid status for processing",
                            "Status: " + transaction.getStatus(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(400, "Transaction in invalid status: " + transaction.getStatus(), "Invalid Status", transaction));
                })
                .onErrorResume(e -> {
                    Long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "verifyAndCompleteTransaction",
                            duration, 500, "Error verifying transaction",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500, "Error verifying transaction", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> queuePaymentForBackgroundProcessing(String reference) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "reference=" + reference;

        LoggingUtility.logInfo(logger, transactionId, "queuePaymentForBackgroundProcessing",
                null, 200, "Queueing payment for background processing", requestPayload, null);

        // Find the transaction by reference
        return transactionRepository.findByPaystackReference(reference)
                .switchIfEmpty(Mono.defer(() -> {
                    Long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "queuePaymentForBackgroundProcessing",
                            duration, 404, "Transaction not found for reference",
                            "Reference: " + reference, requestPayload, null);
                    return Mono.error(new IllegalArgumentException("Transaction not found for reference: " + reference));
                }))
                .flatMap(transaction -> {
                    // If already completed, return success
                    if ("COMPLETED".equals(transaction.getStatus())) {
                        Long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "queuePaymentForBackgroundProcessing",
                                duration, 200, "Transaction already completed",
                                requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(200, "Transaction already completed", "Success", transaction));
                    }

                    // If failed, return error
                    if ("FAILED".equals(transaction.getStatus())) {
                        Long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "queuePaymentForBackgroundProcessing",
                                duration, 400, "Transaction already failed",
                                "Status: FAILED", requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(400, "Transaction already failed", "Failed", transaction));
                    }

                    // Transaction is pending - background processor will handle it
                    Long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "queuePaymentForBackgroundProcessing",
                            duration, 200, "Payment queued for background processing",
                            "Transaction UUID: " + transaction.getTransactionUuid(), requestPayload);
                    return Mono.just(ApiResponse.createResponse(200, "Payment queued for background processing", "Success", transaction));
                })
                .onErrorResume(e -> {
                    Long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "queuePaymentForBackgroundProcessing",
                            duration, 500, "Error queueing payment for background processing",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(500, "Error queueing payment", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> markTransactionAsFailed(String transactionUuid, String reason) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "transactionUuid=" + transactionUuid + ", reason=" + reason;

        LoggingUtility.logInfo(logger, transactionId, "markTransactionAsFailed",
                null, 200, "Marking transaction as failed (background processing)", requestPayload, null);

        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Transaction not found")))
                .flatMap(transaction -> {
                    if ("FAILED".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "markTransactionAsFailed",
                                duration, CODE_CONFLICT, "Transaction already failed",
                                "Conflict", requestPayload, "");
                        return Mono.just(transaction);
                    }

                    if (!"PENDING".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, transactionId, "markTransactionAsFailed",
                                duration, CODE_VALIDATION, "Transaction in invalid state",
                                transaction.getStatus(), requestPayload, null);
                        return Mono.error(new IllegalStateException(
                                "Transaction in invalid state: " + transaction.getStatus()));
                    }

                    // Only update status and timestamp, preserve original description
                    transaction.setStatus("FAILED");
                    transaction.setUpdatedAt(LocalDateTime.now());
                    return transactionRepository.save(transaction);
                })
                .map(transaction -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(200, "Transaction marked as failed", "Success", transaction);
                    LoggingUtility.logInfo(logger, transactionId, "markTransactionAsFailed",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return response;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "markTransactionAsFailed",
                            duration, CODE_VALIDATION, "Error marking transaction as failed",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(400, "Error marking transaction as failed", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> completeTransactionWithNotes(String transactionUuid, String paystackPaymentId, String notes, String callbackResponse) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("transactionUuid: %s, paystackPaymentId: %s, notes: %s",
                transactionUuid, paystackPaymentId, notes);

        LoggingUtility.logInfo(logger, transactionId, "completeTransactionWithNotes",
                null, 200, null, requestPayload, null);

        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.defer(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logWarn(logger, transactionId, "completeTransactionWithNotes",
                            duration, 404, "Transaction not found",
                            "Transaction UUID: " + transactionUuid, requestPayload, null);
                    return Mono.error(new IllegalArgumentException("Transaction not found"));
                }))
                .flatMap(transaction -> {
                    if ("COMPLETED".equals(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "completeTransactionWithNotes",
                                duration, CODE_CONFLICT, "Transaction already completed",
                                "Conflict", requestPayload, "");
                        return Mono.just(transaction);
                    }

                    if (!"PENDING".equalsIgnoreCase(transaction.getStatus()) && 
                        !"INITIALIZED".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, transactionId, "completeTransactionWithNotes",
                                duration, CODE_VALIDATION, "Transaction in invalid state",
                                transaction.getStatus(), requestPayload, null);
                        return Mono.error(new IllegalStateException(
                                "Transaction in invalid state: " + transaction.getStatus()));
                    }

                    // Update transaction with completion details
                    transaction.setStatus("COMPLETED");
                    transaction.setStripePaymentId(paystackPaymentId);
                    transaction.setPaymentMethod("CARD");
                    transaction.setUpdatedAt(LocalDateTime.now());
                    transaction.setNotes(notes);
                    transaction.setCallbackResponse(callbackResponse);

                    // Parallel execution of wallet update and transaction save
                    Mono<CoinWallet> walletUpdate = walletRepository.findByUserId(transaction.getUserId())
                            .switchIfEmpty(createNewWallet(transaction.getUserId()))
                            .flatMap(wallet -> {
                                wallet.addCoins(transaction.getCoins());
                                return walletRepository.save(wallet);
                            });

                    Mono<CoinTransaction> transactionSave = transactionRepository.save(transaction);

                    return Mono.zip(walletUpdate, transactionSave)
                            .map(tuple -> {
                                long duration = System.currentTimeMillis() - startTime;
                                LoggingUtility.logInfo(logger, transactionId, "completeTransactionWithNotes",
                                        duration, CODE_SUCCESS, OPERATION_SUCCESS,
                                        null, "");
                                return tuple.getT2(); // Return the saved transaction
                            });
                })
                .map(transaction -> ApiResponse.createResponse(200, "Transaction completed successfully", "Success", transaction))
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "completeTransactionWithNotes",
                            duration, CODE_VALIDATION, "Error completing transaction",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(400, "Error completing transaction", e.getMessage(), null));
                });
    }

    @Override
    public Mono<ApiResponse> markTransactionAsFailedWithNotes(String transactionUuid, String reason, String callbackResponse) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "transactionUuid=" + transactionUuid + ", reason=" + reason;

        LoggingUtility.logInfo(logger, transactionId, "markTransactionAsFailedWithNotes",
                null, 200, "Marking transaction as failed with notes (background processing)", requestPayload, null);

        return transactionRepository.findByTransactionUuid(transactionUuid)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Transaction not found")))
                .flatMap(transaction -> {
                    if ("FAILED".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logWarn(logger, transactionId, "markTransactionAsFailedWithNotes",
                                duration, CODE_CONFLICT, "Transaction already failed",
                                "Conflict", requestPayload, "");
                        return Mono.just(transaction);
                    }

                    if (!"PENDING".equalsIgnoreCase(transaction.getStatus()) && 
                        !"INITIALIZED".equalsIgnoreCase(transaction.getStatus())) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, transactionId, "markTransactionAsFailedWithNotes",
                                duration, CODE_VALIDATION, "Transaction in invalid state",
                                transaction.getStatus(), requestPayload, null);
                        return Mono.error(new IllegalStateException(
                                "Transaction in invalid state: " + transaction.getStatus()));
                    }

                    // Only update status, timestamp, notes, and callback response - preserve original description
                    transaction.setStatus("FAILED");
                    transaction.setUpdatedAt(LocalDateTime.now());
                    transaction.setNotes(reason);
                    transaction.setCallbackResponse(callbackResponse);
                    return transactionRepository.save(transaction);
                })
                .map(transaction -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ApiResponse response = ApiResponse.createResponse(200, "Transaction marked as failed", "Success", transaction);
                    LoggingUtility.logInfo(logger, transactionId, "markTransactionAsFailedWithNotes",
                            duration, CODE_SUCCESS, OPERATION_SUCCESS,
                            null, "");
                    return response;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "markTransactionAsFailedWithNotes",
                            duration, CODE_VALIDATION, "Error marking transaction as failed",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(400, "Error marking transaction as failed", e.getMessage(), null));
                });
    }
}