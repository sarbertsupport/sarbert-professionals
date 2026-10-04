package com.albert.microservices.teaching.marketplace.controllers;

import com.albert.microservices.teaching.marketplace.services.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/totals")
    public Mono<Map<String, Object>> getDashboardTotals() {
        return dashboardService.getDashboardTotals();
    }

    @GetMapping("/revenue-chart")
    public Mono<Map<String, Object>> getRevenueChartData(
            @RequestParam(value = "range", defaultValue = "yoy") String range,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "quarter", required = false) Integer quarter,
            @RequestParam(value = "month", required = false) Integer month) {
        return dashboardService.getRevenueChartData(range, year, quarter, month);
    }

    @GetMapping("/revenue-stats")
    public Mono<Map<String, Object>> getRevenueStats() {
        return dashboardService.getRevenueStats();
    }

    @GetMapping("/payment-method-trend")
    public Mono<Map<String, Object>> getPaymentMethodTrend(
            @RequestParam(value = "days", defaultValue = "30") int days) {
        int safeDays = Math.min(Math.max(days, 1), 366);
        return dashboardService.getPaymentMethodTrend(safeDays);
    }
}