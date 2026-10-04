package com.albert.microservices.teaching.marketplace.services;
import reactor.core.publisher.Mono;

import java.util.Map;

public interface DashboardService {
     Mono<Map<String, Object>> getDashboardTotals();
     Mono<Map<String, Object>> getRevenueChartData(String range, Integer year, Integer quarter, Integer month);
     Mono<Map<String, Object>> getRevenueStats();
     /**
      * Daily trend of CARD vs M-Pesa revenue and share of total (completed coin purchases).
      * @param days number of calendar days ending today (default 30)
      */
     Mono<Map<String, Object>> getPaymentMethodTrend(Integer days);
}
