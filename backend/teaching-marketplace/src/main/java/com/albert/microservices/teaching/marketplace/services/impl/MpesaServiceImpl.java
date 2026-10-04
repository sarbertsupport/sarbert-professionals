package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.configs.MpesaConfig;
import com.albert.microservices.teaching.marketplace.entities.CoinTransaction;
import com.albert.microservices.teaching.marketplace.repositories.CoinTransactionRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.MpesaService;
import com.albert.microservices.teaching.marketplace.services.TransactionCompletionService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import com.albert.microservices.teaching.marketplace.utils.MpesaExpressResultCodes;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MpesaServiceImpl implements MpesaService {
    private final WebClient webClient;
    private final MpesaConfig mpesaConfig;
    private final CoinTransactionRepository transactionRepository;
    private final TransactionCompletionService transactionCompletionService;
    private final ObjectMapper objectMapper;
    private final Logger logger = LoggerFactory.getLogger(MpesaServiceImpl.class);

    /** Avoids a full OAuth round-trip on every STK call; Daraja tokens live ~1h. */
    private static final long ACCESS_TOKEN_REFRESH_SKEW_MS = 120_000;
    private static final Duration OAUTH_BLOCK_TIMEOUT = Duration.ofSeconds(25);

    private volatile CachedAccessToken accessTokenCache;
    private final Object accessTokenLock = new Object();

    private static final class CachedAccessToken {
        final String token;
        final long expiresAtEpochMs;

        CachedAccessToken(String token, long expiresAtEpochMs) {
            this.token = token;
            this.expiresAtEpochMs = expiresAtEpochMs;
        }
    }

    public MpesaServiceImpl(WebClient webClient, MpesaConfig mpesaConfig,
                           CoinTransactionRepository transactionRepository,
                           TransactionCompletionService transactionCompletionService,
                           ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.mpesaConfig = mpesaConfig;
        this.transactionRepository = transactionRepository;
        this.transactionCompletionService = transactionCompletionService;
        this.objectMapper = objectMapper;
    }

    /**
     * Returns a cached Daraja OAuth token when still valid; otherwise fetches once (serialized per JVM).
     * STK initiate + STK Query v2 used to each pay for a separate OAuth hop — that doubles wall-clock latency.
     */
    public Mono<String> getAccessToken() {
        CachedAccessToken snap = accessTokenCache;
        long now = System.currentTimeMillis();
        if (snap != null && snap.expiresAtEpochMs > now + ACCESS_TOKEN_REFRESH_SKEW_MS) {
            return Mono.just(snap.token);
        }
        return Mono.fromCallable(this::refreshAccessTokenBlocking)
                .subscribeOn(Schedulers.boundedElastic());
    }

    @SuppressWarnings("unchecked")
    private String refreshAccessTokenBlocking() {
        synchronized (accessTokenLock) {
            CachedAccessToken snap = accessTokenCache;
            long now = System.currentTimeMillis();
            if (snap != null && snap.expiresAtEpochMs > now + ACCESS_TOKEN_REFRESH_SKEW_MS) {
                return snap.token;
            }

            String transactionId = UUID.randomUUID().toString();
            long startTime = System.currentTimeMillis();

            String credentials = mpesaConfig.getConsumerKey() + ":" + mpesaConfig.getConsumerSecret();
            String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

            try {
                Map<String, Object> response = webClient.get()
                        .uri(mpesaConfig.getOauthUrl())
                        .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials)
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block(OAUTH_BLOCK_TIMEOUT);

                if (response == null || !response.containsKey("access_token")) {
                    throw new IllegalStateException("OAuth response missing access_token");
                }
                String token = (String) response.get("access_token");
                long expiresInSec = 3500L;
                Object expiresIn = response.get("expires_in");
                if (expiresIn instanceof Number) {
                    expiresInSec = ((Number) expiresIn).longValue();
                } else if (expiresIn != null) {
                    try {
                        expiresInSec = Long.parseLong(expiresIn.toString());
                    } catch (NumberFormatException ignored) {
                        // keep default
                    }
                }
                accessTokenCache = new CachedAccessToken(token, System.currentTimeMillis() + expiresInSec * 1000L);

                long duration = System.currentTimeMillis() - startTime;
                LoggingUtility.logInfo(logger, transactionId, "getAccessToken",
                        duration, 200, "Success (refreshed)", null, null);
                return token;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                LoggingUtility.logError(logger, transactionId, "getAccessToken",
                        duration, 500, "Error getting M-Pesa token",
                        e.getMessage(), null, null);
                throw new RuntimeException("Failed to get M-Pesa access token", e);
            }
        }
    }

    public Mono<ApiResponse> initiateSTKPush(Integer userId, String phoneNumber, Double amount, int coins,
                                             String idempotencyKey) {
        String logTxnId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("userId=%d, phoneNumber=%s, amount=%.2f, coins=%d",
                userId, phoneNumber, amount, coins);

        LoggingUtility.logInfo(logger, logTxnId, "initiateSTKPush",
                null, 200, null, requestPayload, null);

        if (StringUtils.hasText(idempotencyKey)) {
            return transactionRepository.findByIdempotencyKey(idempotencyKey)
                    .map(existing -> idempotentReplayResponse(existing, logTxnId, startTime))
                    .switchIfEmpty(Mono.defer(() -> executeNewStkPush(userId, phoneNumber, amount, coins,
                            idempotencyKey, logTxnId, startTime, requestPayload)));
        }

        return executeNewStkPush(userId, phoneNumber, amount, coins, idempotencyKey, logTxnId, startTime, requestPayload);
    }

    private ApiResponse idempotentReplayResponse(CoinTransaction existing, String logTxnId, long startTime) {
        long duration = System.currentTimeMillis() - startTime;
        LoggingUtility.logInfo(logger, logTxnId, "initiateSTKPush",
                duration, 200, "Idempotent replay for Idempotency-Key", null, null);
        Map<String, Object> data = new HashMap<>();
        data.put("transactionId", existing.getId());
        data.put("transactionUuid", existing.getTransactionUuid());
        data.put("status", existing.getStatus());
        data.put("mpesaCheckoutRequestId", existing.getMpesaCheckoutRequestId());
        data.put("mpesaMerchantRequestId", existing.getMpesaMerchantRequestId());
        data.put("coins", existing.getCoins());
        data.put("amount", existing.getAmount());
        return ApiResponse.createResponse(200,
                "Repeated request with same Idempotency-Key",
                "Returning existing M-Pesa coin purchase record (no duplicate STK push).",
                data);
    }

    private Mono<ApiResponse> executeNewStkPush(Integer userId, String phoneNumber, Double amount, int coins,
                                                String idempotencyKey, String logTxnId, long startTime,
                                                String requestPayload) {
        try {
            String formattedPhone = formatPhoneNumber(phoneNumber);
            if (formattedPhone.length() != 12 || !formattedPhone.startsWith("254")) {
                throw new IllegalArgumentException("Invalid phone number format. Must be 254XXXXXXXXX");
            }

            int amountInShillings = (int) Math.round(amount);

            CoinTransaction transaction = new CoinTransaction();
            transaction.setUserId(userId);
            transaction.setAmount((double) amountInShillings);
            transaction.setCurrency("KES");
            transaction.setStatus("INITIATING");
            transaction.setCoins(coins);
            transaction.setDescription("Purchase of " + coins + " coins via M-Pesa");
            transaction.setEntryType("DEBIT");
            transaction.setPaymentMethod("MPESA");
            transaction.setMpesaPhoneNumber(formattedPhone);
            if (StringUtils.hasText(idempotencyKey)) {
                transaction.setIdempotencyKey(idempotencyKey);
            }

            return getAccessToken()
                    .flatMap(accessToken -> {
                        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                        String password = generatePassword(timestamp);

                        String accountReference = "COINS_" + logTxnId.substring(0, 8);
                        accountReference = accountReference.length() > 12 ? accountReference.substring(0, 12) : accountReference;

                        String transactionDesc = coins + " COINS";
                        transactionDesc = transactionDesc.length() > 13 ? transactionDesc.substring(0, 13) : transactionDesc;

                        Map<String, Object> requestBody = new HashMap<>();
                        requestBody.put("BusinessShortCode", mpesaConfig.getBusinessShortCode());
                        requestBody.put("Password", password);
                        requestBody.put("Timestamp", timestamp);
                        requestBody.put("TransactionType", mpesaConfig.getTransactionType());
                        requestBody.put("Amount", amountInShillings);
                        requestBody.put("PartyA", formattedPhone);
                        requestBody.put("PartyB", mpesaConfig.getBusinessShortCode());
                        requestBody.put("PhoneNumber", formattedPhone);
                        requestBody.put("CallBackURL", mpesaConfig.getCallbackUrl());
                        requestBody.put("AccountReference", accountReference);
                        requestBody.put("TransactionDesc", transactionDesc);

                        return webClient.post()
                                .uri(mpesaConfig.getStkPushUrl())
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                                .bodyValue(requestBody)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .flatMap(response -> {
                                    String merchantRequestId = stringVal(response.get("MerchantRequestID"));
                                    String checkoutRequestId = stringVal(response.get("CheckoutRequestID"));
                                    String responseCode = String.valueOf(response.get("ResponseCode"));
                                    String responseDescription = stringVal(response.get("ResponseDescription"));
                                    String customerMessage = stringVal(response.get("CustomerMessage"));

                                    if ("0".equals(responseCode)) {
                                        transaction.setMpesaMerchantRequestId(merchantRequestId);
                                        transaction.setMpesaCheckoutRequestId(checkoutRequestId);
                                        transaction.setStatus("PENDING");

                                        return transactionRepository.save(transaction)
                                                .map(savedTransaction -> {
                                                    long duration = System.currentTimeMillis() - startTime;
                                                    LoggingUtility.logInfo(logger, logTxnId, "initiateSTKPush",
                                                            duration, 200, "Success",
                                                            null, "");
                                                    return ApiResponse.createResponse(
                                                            200,
                                                            "Payment request sent successfully",
                                                            customerMessage != null ? customerMessage : responseDescription,
                                                            savedTransaction
                                                    );
                                                });
                                    } else {
                                        long duration = System.currentTimeMillis() - startTime;
                                        LoggingUtility.logError(logger, logTxnId, "initiateSTKPush",
                                                duration, 400, "M-Pesa STK initiate error",
                                                responseDescription, requestPayload, null);
                                        return Mono.just(ApiResponse.createResponse(
                                                400,
                                                "Payment request failed",
                                                responseDescription,
                                                Map.of("responseCode", responseCode, "responseDescription", responseDescription)
                                        ));
                                    }
                                })
                                .onErrorResume(WebClientResponseException.class, ex -> {
                                    long duration = System.currentTimeMillis() - startTime;
                                    String body = ex.getResponseBodyAsString();
                                    String detail = (body != null && !body.isBlank()) ? body.trim() : ex.getMessage();
                                    int status = ex.getStatusCode().value();
                                    LoggingUtility.logError(logger, logTxnId, "initiateSTKPush",
                                            duration, status, "M-Pesa STK HTTP error (Safaricom processrequest)",
                                            detail, requestPayload, null);
                                    int responseCode = (status >= 400 && status < 600) ? status : 502;
                                    return Mono.just(ApiResponse.createResponse(
                                            responseCode,
                                            "M-Pesa rejected the STK request",
                                            detail,
                                            Map.of(
                                                    "httpStatus", status,
                                                    "safaricomResponse", detail,
                                                    "transactionType", mpesaConfig.getTransactionType()
                                            )
                                    ));
                                });
                    })
                    .onErrorResume(e -> {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, logTxnId, "initiateSTKPush",
                                duration, 500, "Error initiating STK Push",
                                e.getMessage(), requestPayload, null);
                        return Mono.just(ApiResponse.createResponse(
                                500,
                                "Error initiating payment",
                                e.getMessage(),
                                null
                        ));
                    });
        } catch (IllegalArgumentException e) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logError(logger, logTxnId, "initiateSTKPush",
                    duration, 400, "Validation error",
                    e.getMessage(), requestPayload, null);
            return Mono.just(ApiResponse.createResponse(
                    400,
                    "Validation error",
                    e.getMessage(),
                    null
            ));
        }
    }

    @Override
    public Mono<ApiResponse> reconcileStkViaQueryV2(long coinTransactionId) {
        String logId = UUID.randomUUID().toString();
        long start = System.currentTimeMillis();

        if (!StringUtils.hasText(mpesaConfig.getStkPushQueryUrl())) {
            return Mono.just(ApiResponse.createResponse(500, "M-Pesa query not configured",
                    "Set mpesa.stk-push-query-url", null));
        }

        Mono<ApiResponse> pipeline = transactionRepository.findById(coinTransactionId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Transaction not found")))
                .flatMap(tx -> {
                    if (!"MPESA".equalsIgnoreCase(String.valueOf(tx.getPaymentMethod()))) {
                        return Mono.just(ApiResponse.createResponse(400, "Not an M-Pesa transaction",
                                "paymentMethod must be MPESA", null));
                    }
                    if (!StringUtils.hasText(tx.getMpesaCheckoutRequestId())) {
                        return Mono.just(ApiResponse.createResponse(400, "Missing CheckoutRequestID",
                                "STK was not initiated or checkout id was not stored.", null));
                    }
                    LocalDateTime created = tx.getCreatedAt() != null ? tx.getCreatedAt() : LocalDateTime.now();
                    long secondsSince = Duration.between(created, LocalDateTime.now()).getSeconds();
                    int minAge = Math.max(0, mpesaConfig.getStkQueryMinAgeSeconds());
                    if (secondsSince < minAge) {
                        long wait = minAge - secondsSince;
                        return Mono.just(ApiResponse.createResponse(429, "Query sent too soon",
                                "Wait at least " + minAge + "s after initiation before STK Query v2. Retry in about " + wait + "s.",
                                Map.of("retryAfterSeconds", wait, "minAgeSeconds", minAge)));
                    }

                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                    String password = generatePassword(timestamp);
                    Map<String, Object> queryBody = new HashMap<>();
                    queryBody.put("BusinessShortCode", mpesaConfig.getBusinessShortCode());
                    queryBody.put("Password", password);
                    queryBody.put("Timestamp", timestamp);
                    queryBody.put("CheckoutRequestID", tx.getMpesaCheckoutRequestId());

                    return getAccessToken()
                            .flatMap(token -> webClient.post()
                                    .uri(mpesaConfig.getStkPushQueryUrl())
                                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                                    .bodyValue(queryBody)
                                    .retrieve()
                                    .bodyToMono(Map.class)
                                    .flatMap(raw -> applyStkQueryResult(tx, raw, logId, start)));
                });
        return pipeline.onErrorResume((Throwable errorSignal) -> reconcileErrorResponse(errorSignal, logId, start));
    }

    private Mono<ApiResponse> reconcileErrorResponse(Throwable err, String logId, long start) {
        if (err instanceof IllegalArgumentException iae) {
            String m = iae.getMessage() != null ? iae.getMessage() : "Not found";
            return Mono.just(ApiResponse.createResponse(404, m, m, null));
        }
        LoggingUtility.logError(logger, logId, "reconcileStkViaQueryV2",
                System.currentTimeMillis() - start, 500, "reconcile error", err.getMessage(), null, null);
        return Mono.just(ApiResponse.createResponse(500, "STK query failed",
                err.getMessage() != null ? err.getMessage() : "Unknown error", null));
    }

    @SuppressWarnings("unchecked")
    private Mono<ApiResponse> applyStkQueryResult(CoinTransaction tx, Map<String, Object> raw, String logId, long start) {
        String json = toJson(raw);
        LocalDateTime now = LocalDateTime.now();
        tx.setMpesaLastStkQueryAt(now);
        tx.setMpesaStkQueryResponse(json);

        String apiResponseCode = String.valueOf(raw.getOrDefault("ResponseCode", ""));
        String apiResponseDesc = stringVal(raw.get("ResponseDescription"));

        if (!"0".equals(apiResponseCode)) {
            tx.setUpdatedAt(now);
            return transactionRepository.save(tx)
                    .map(saved -> {
                        LoggingUtility.logWarn(logger, logId, "reconcileStkViaQueryV2",
                                System.currentTimeMillis() - start, 502, "Query API error", apiResponseDesc, null, null);
                        return ApiResponse.createResponse(502, "Safaricom STK Query rejected the request",
                                apiResponseDesc != null ? apiResponseDesc : "ResponseCode=" + apiResponseCode,
                                Map.of(
                                        "transactionId", saved.getId(),
                                        "transactionUuid", saved.getTransactionUuid(),
                                        "queryResponse", raw
                                ));
                    });
        }

        int resultCode = MpesaExpressResultCodes.parseInt(raw.get("ResultCode"));
        String resultDesc = stringVal(raw.get("ResultDesc"));
        String receipt = firstNonBlank(
                stringVal(raw.get("MpesaReceiptNumber")),
                extractReceiptFromQueryNested(raw)
        );

        tx.setMpesaResultCode(String.valueOf(resultCode));
        tx.setMpesaResultDesc(resultDesc);
        if (resultDesc != null && !resultDesc.isBlank()) {
            String hint = MpesaExpressResultCodes.describe(resultCode);
            tx.setNotes(trimNotes(tx.getNotes(), "STK Query v2: " + hint + " — " + resultDesc));
        }

        boolean paymentOk = resultCode == 0;
        boolean wasPending = "PENDING".equalsIgnoreCase(tx.getStatus()) || "INITIATING".equalsIgnoreCase(tx.getStatus());

        if (paymentOk) {
            if (StringUtils.hasText(receipt)) {
                tx.setMpesaReceiptNumber(receipt);
            }
            if (wasPending) {
                tx.setStatus("COMPLETED");
                tx.setUpdatedAt(now);
                return transactionRepository.save(tx)
                        .flatMap(saved -> transactionCompletionService.completeTransaction(
                                        saved.getTransactionUuid(),
                                        saved.getMpesaReceiptNumber() != null ? saved.getMpesaReceiptNumber() : "",
                                        "MPESA"
                                )
                                .map(cr -> ApiResponse.createResponse(200,
                                        "Reconciled via STK Query v2",
                                        "Payment successful; wallet updated if not already credited.",
                                        buildReconcilePayload(saved, raw)))
                                .onErrorResume(e -> Mono.just(ApiResponse.createResponse(500,
                                        "Saved receipt but completion failed",
                                        e.getMessage(),
                                        buildReconcilePayload(saved, raw)))));
            }
            tx.setUpdatedAt(now);
            return transactionRepository.save(tx)
                    .map(saved -> ApiResponse.createResponse(200,
                            "STK Query v2 — already settled",
                            "Transaction was not pending; audit fields updated.",
                            buildReconcilePayload(saved, raw)));
        }

        if (wasPending) {
            tx.setStatus("FAILED");
            tx.setDescription(trimDesc("M-Pesa STK Query: " + (resultDesc != null ? resultDesc : "code " + resultCode)));
            tx.setUpdatedAt(now);
        } else {
            tx.setUpdatedAt(now);
        }
        return transactionRepository.save(tx)
                .map(saved -> ApiResponse.createResponse(200,
                        "STK Query v2 — not successful",
                        MpesaExpressResultCodes.describe(resultCode),
                        buildReconcilePayload(saved, raw)));
    }

    private static Map<String, Object> buildReconcilePayload(CoinTransaction saved, Map<String, Object> raw) {
        Map<String, Object> m = new HashMap<>();
        m.put("transactionId", saved.getId());
        m.put("transactionUuid", saved.getTransactionUuid());
        m.put("status", saved.getStatus());
        m.put("mpesaReceiptNumber", saved.getMpesaReceiptNumber());
        m.put("mpesaResultCode", saved.getMpesaResultCode());
        m.put("mpesaResultDesc", saved.getMpesaResultDesc());
        m.put("mpesaLastStkQueryAt", saved.getMpesaLastStkQueryAt());
        m.put("queryResponse", raw);
        return m;
    }

    @SuppressWarnings("unchecked")
    private static String extractReceiptFromQueryNested(Map<String, Object> raw) {
        Object body = raw.get("Body");
        if (body instanceof Map<?, ?> bm) {
            Object cb = bm.get("stkCallback");
            if (cb instanceof Map<?, ?> stk) {
                Object meta = stk.get("CallbackMetadata");
                if (meta instanceof Map<?, ?> mm) {
                    return extractReceiptFromMetadata((Map<String, Object>) mm);
                }
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static String extractReceiptFromMetadata(Map<String, Object> callbackMetadata) {
        Object items = callbackMetadata.get("Item");
        if (items instanceof List<?> list) {
            for (Object o : list) {
                if (o instanceof Map<?, ?> im) {
                    Object name = im.get("Name");
                    if ("MpesaReceiptNumber".equals(String.valueOf(name))) {
                        Object v = im.get("Value");
                        return v != null ? v.toString() : null;
                    }
                }
            }
        }
        return null;
    }

    private String toJson(Map<String, Object> raw) {
        try {
            return objectMapper.writeValueAsString(raw);
        } catch (JsonProcessingException e) {
            return String.valueOf(raw);
        }
    }

    private String formatPhoneNumber(String phoneNumber) {
        String digits = phoneNumber.replaceAll("[^0-9]", "");

        if (digits.startsWith("0") && digits.length() == 10) {
            return "254" + digits.substring(1);
        } else if (digits.startsWith("254") && digits.length() == 12) {
            return digits;
        } else if (digits.startsWith("+254") && digits.length() == 13) {
            return digits.substring(1);
        } else if (digits.length() == 9) {
            return "254" + digits;
        }

        throw new IllegalArgumentException("Invalid phone number format. Expected formats: 07XXXXXXXX, 2547XXXXXXXX, or +2547XXXXXXXX");
    }

    public Mono<Void> handleMpesaCallback(Map<String, Object> callbackData) {
        String logTxnId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        try {
            String payloadJson = objectMapper.writeValueAsString(callbackData);
            LoggingUtility.logInfo(logger, logTxnId, "handleMpesaCallback",
                    null, 200, null, payloadJson, null);

            Map<String, Object> body = expectMap(callbackData.get("Body"), "Body");
            Map<String, Object> stkCallback = expectMap(body.get("stkCallback"), "stkCallback");

            String merchantRequestId = stringVal(stkCallback.get("MerchantRequestID"));
            String checkoutRequestId = stringVal(stkCallback.get("CheckoutRequestID"));
            int resultCode = MpesaExpressResultCodes.parseInt(stkCallback.get("ResultCode"));
            String resultDesc = stringVal(stkCallback.get("ResultDesc"));

            if (!StringUtils.hasText(checkoutRequestId)) {
                LoggingUtility.logError(logger, logTxnId, "handleMpesaCallback",
                        System.currentTimeMillis() - startTime, 400, "Missing CheckoutRequestID", null, payloadJson, null);
                return Mono.empty();
            }

            return transactionRepository.findByMpesaCheckoutRequestId(checkoutRequestId)
                    .switchIfEmpty(Mono.defer(() -> {
                        LoggingUtility.logError(logger, logTxnId, "handleMpesaCallback",
                                System.currentTimeMillis() - startTime, 404, "Unknown checkout id",
                                checkoutRequestId, payloadJson, null);
                        return Mono.empty();
                    }))
                    .flatMap(transaction -> {
                        if ("COMPLETED".equalsIgnoreCase(transaction.getStatus())) {
                            transaction.setCallbackResponse(payloadJson);
                            transaction.setMpesaResultCode(String.valueOf(resultCode));
                            transaction.setMpesaResultDesc(resultDesc);
                            if (resultCode == 0) {
                                Map<String, Object> callbackMetadata = stkCallback.get("CallbackMetadata") instanceof Map<?, ?> m
                                        ? (Map<String, Object>) m
                                        : null;
                                if (!StringUtils.hasText(transaction.getMpesaReceiptNumber())
                                        || !StringUtils.hasText(transaction.getMpesaPhoneNumber())) {
                                    applyCallbackItems(transaction, callbackMetadata);
                                }
                            }
                            transaction.setUpdatedAt(LocalDateTime.now());
                            return transactionRepository.save(transaction).then();
                        }

                        transaction.setCallbackResponse(payloadJson);
                        transaction.setMpesaResultCode(String.valueOf(resultCode));
                        transaction.setMpesaResultDesc(resultDesc);
                        if (StringUtils.hasText(merchantRequestId)) {
                            transaction.setMpesaMerchantRequestId(merchantRequestId);
                        }

                        if (resultCode == 0) {
                            Map<String, Object> callbackMetadata = stkCallback.get("CallbackMetadata") instanceof Map<?, ?> m
                                    ? (Map<String, Object>) m
                                    : null;
                            applyCallbackItems(transaction, callbackMetadata);

                            String hint = MpesaExpressResultCodes.describe(resultCode);
                            transaction.setNotes(trimNotes(transaction.getNotes(), "Callback: " + hint));

                            transaction.setStatus("COMPLETED");
                            transaction.setUpdatedAt(LocalDateTime.now());

                            return transactionRepository.save(transaction)
                                    .flatMap(saved ->
                                            transactionCompletionService.completeTransaction(
                                                    saved.getTransactionUuid(),
                                                    saved.getMpesaReceiptNumber(),
                                                    "MPESA"
                                            ).then())
                                    .doOnSuccess(v -> LoggingUtility.logInfo(logger, logTxnId, "handleMpesaCallback",
                                            System.currentTimeMillis() - startTime, 200, "Success", null, null));
                        }

                        transaction.setStatus("FAILED");
                        transaction.setDescription(trimDesc("M-Pesa: "
                                + MpesaExpressResultCodes.describe(resultCode)
                                + (resultDesc != null ? (" — " + resultDesc) : "")));
                        transaction.setUpdatedAt(LocalDateTime.now());
                        return transactionRepository.save(transaction)
                                .doOnSuccess(v -> LoggingUtility.logWarn(logger, logTxnId, "handleMpesaCallback",
                                        System.currentTimeMillis() - startTime, 200, "Payment failed",
                                        resultDesc, null, null))
                                .then();
                    });
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logError(logger, logTxnId, "handleMpesaCallback",
                    duration, 500, "Error parsing callback data",
                    e.getMessage(), String.valueOf(callbackData), null);
            return Mono.empty();
        }
    }

    @SuppressWarnings("unchecked")
    private void applyCallbackItems(CoinTransaction transaction, Map<String, Object> callbackMetadata) {
        if (callbackMetadata == null) {
            return;
        }
        Object rawItems = callbackMetadata.get("Item");
        if (!(rawItems instanceof List<?> items)) {
            return;
        }
        for (Object o : items) {
            if (!(o instanceof Map<?, ?> item)) {
                continue;
            }
            String name = String.valueOf(item.get("Name"));
            Object value = item.get("Value");
            if (value == null) {
                continue;
            }
            switch (name) {
                case "Amount":
                    try {
                        transaction.setAmount(Double.parseDouble(value.toString()));
                    } catch (NumberFormatException ignored) {
                        // ignore
                    }
                    break;
                case "MpesaReceiptNumber":
                    transaction.setMpesaReceiptNumber(value.toString());
                    break;
                case "PhoneNumber":
                    transaction.setMpesaPhoneNumber(value.toString());
                    break;
                default:
                    break;
            }
        }
    }

    private static Map<String, Object> expectMap(Object o, String label) {
        if (!(o instanceof Map<?, ?> m)) {
            throw new IllegalArgumentException("Invalid callback: " + label + " is not an object");
        }
        return (Map<String, Object>) m;
    }

    private static String stringVal(Object o) {
        return o == null ? null : o.toString();
    }

    private static String firstNonBlank(String a, String b) {
        if (StringUtils.hasText(a)) {
            return a;
        }
        if (StringUtils.hasText(b)) {
            return b;
        }
        return null;
    }

    private static String trimNotes(String existing, String line) {
        if (!StringUtils.hasText(line)) {
            return existing;
        }
        if (!StringUtils.hasText(existing)) {
            return line;
        }
        if (existing.contains(line)) {
            return existing;
        }
        return existing.length() + line.length() > 1800
                ? (existing.substring(0, Math.max(0, 1200)) + "\n…\n" + line)
                : (existing + "\n" + line);
    }

    private static String trimDesc(String d) {
        if (d == null) {
            return null;
        }
        return d.length() > 500 ? d.substring(0, 497) + "..." : d;
    }

    private String generatePassword(String timestamp) {
        String data = mpesaConfig.getBusinessShortCode() + mpesaConfig.getPasskey() + timestamp;
        return Base64.getEncoder().encodeToString(data.getBytes(StandardCharsets.UTF_8));
    }
}
