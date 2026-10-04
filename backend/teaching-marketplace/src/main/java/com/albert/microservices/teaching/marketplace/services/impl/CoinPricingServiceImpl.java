package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.BulkDiscount;
import com.albert.microservices.teaching.marketplace.entities.Pricing;
import com.albert.microservices.teaching.marketplace.repositories.BulkDiscountRepository;
import com.albert.microservices.teaching.marketplace.repositories.PricingRepository;
import com.albert.microservices.teaching.marketplace.requests.CoinPriceCalculation;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.services.CoinPricingService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static com.albert.microservices.teaching.marketplace.utils.Constants.*;

@Service
public class CoinPricingServiceImpl implements CoinPricingService {
    private static final Logger logger = LoggerFactory.getLogger(CoinPricingServiceImpl.class);
    private final PricingRepository pricingRepository;
    private final BulkDiscountRepository discountRepository;

    public CoinPricingServiceImpl(PricingRepository pricingRepository, BulkDiscountRepository discountRepository) {
        this.pricingRepository = pricingRepository;
        this.discountRepository = discountRepository;
    }

    @Override
    public Mono<ApiResponse> calculateCoinPrice(Integer coinsToBuy) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = "coinsToBuy=" + coinsToBuy;

        LoggingUtility.logInfo(logger, transactionId, "calculateCoinPrice",
                null, 200, null, requestPayload, null);

        // Validate minimum coins requirement
        if (coinsToBuy == null || coinsToBuy < 50) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logWarn(logger, transactionId, "calculateCoinPrice",
                    duration, CODE_VALIDATION, "Invalid coin amount",
                    "Minimum purchase is 50 coins", requestPayload, null);
            return Mono.just(ApiResponse.createResponse(
                    CODE_VALIDATION,
                    "Invalid coin amount",
                    "Minimum purchase is 50 coins",
                    null
            ));
        }

        return Mono.zip(
                pricingRepository.findCurrentPricing(),
                discountRepository.findAllActiveDiscounts().collectList()
        )
                .flatMap(tuple -> {
                    Pricing currentPricing = tuple.getT1();
                    List<BulkDiscount> discounts = tuple.getT2();

                    if (currentPricing == null) {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, transactionId, "calculateCoinPrice",
                                duration, CODE_SERVER_ERROR, "Pricing not configured",
                                null, requestPayload, null);
                        return Mono.error(new IllegalStateException("Pricing not configured"));
                    }

                    CoinPriceCalculation calculation = calculatePrice(coinsToBuy, currentPricing, discounts);
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "calculateCoinPrice",
                            duration, CODE_SUCCESS, "Price calculated successfully",
                            null, "");
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SUCCESS,
                            "Price calculated successfully",
                            OPERATION_SUCCESS,
                            calculation
                    ));
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "calculateCoinPrice",
                            duration, CODE_SERVER_ERROR, "Failed to calculate price",
                            e.getMessage(), requestPayload, null);
                    return Mono.just(ApiResponse.createResponse(
                            CODE_SERVER_ERROR,
                            "Failed to calculate price",
                            e.getMessage(),
                            null
                    ));
                });
    }

    private CoinPriceCalculation calculatePrice(Integer coins, Pricing pricing, List<BulkDiscount> discounts) {
        // Calculate base price and round to 2 decimal places
        BigDecimal basePrice = pricing.getBasePricePerCoin()
                .multiply(new BigDecimal(coins))
                .setScale(2, RoundingMode.HALF_UP);

        // Find applicable discount
        BulkDiscount applicableDiscount = discounts.stream()
                .filter(d -> coins >= d.getMinCoins())
                .max(Comparator.comparing(BulkDiscount::getMinCoins))
                .orElse(null);

        BigDecimal discountAmount = BigDecimal.ZERO.setScale(2);
        BigDecimal finalPrice = basePrice;
        BigDecimal discountPercentage = BigDecimal.ZERO.setScale(2);

        if (applicableDiscount != null) {
            discountPercentage = applicableDiscount.getDiscountPercentage()
                    .setScale(2, RoundingMode.HALF_UP);
            discountAmount = basePrice.multiply(discountPercentage)
                    .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            finalPrice = basePrice.subtract(discountAmount)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return new CoinPriceCalculation(
                coins,
                pricing.getBasePricePerCoin().setScale(2, RoundingMode.HALF_UP),
                basePrice,
                applicableDiscount != null ? applicableDiscount.getMinCoins() : null,
                discountPercentage,
                discountAmount,
                finalPrice
        );
    }
}