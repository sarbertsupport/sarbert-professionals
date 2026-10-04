package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import reactor.core.publisher.Mono;

public interface CoinPricingService {
    Mono<ApiResponse> calculateCoinPrice(Integer coinsToBuy);
}
