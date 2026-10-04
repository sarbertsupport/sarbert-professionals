package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.entities.CoinTransaction;
import com.albert.microservices.teaching.marketplace.repositories.CoinTransactionRepository;
import com.albert.microservices.teaching.marketplace.repositories.RoleRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.services.DashboardService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class DashboardServiceImpl implements DashboardService {
    private static final Logger logger = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CoinTransactionRepository coinTransactionRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                                RoleRepository roleRepository,
                                CoinTransactionRepository coinTransactionRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.coinTransactionRepository = coinTransactionRepository;
    }

    @Override
    public Mono<Map<String, Object>> getDashboardTotals() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getDashboardTotals",
                null, 200, "Request received", null, null);

        // Mono.zip is limited to 8 sources; compose payment metrics with zipWith.
        return Mono.zip(
                        getTotalStudents(),
                        getTotalRevenue(),
                        getMonthlyRevenue(),
                        getDailyRevenue(),
                        getTotalProfessionals(),
                        getLastMonthRevenue(),
                        getYesterdayRevenue(),
                        getLastYearRevenue()
                )
                .zipWith(paymentRailMetricsMono())
                .map(combined -> {
                    var totals = combined.getT1();
                    Map<String, Object> railMetrics = combined.getT2();

                    Map<String, Object> result = new HashMap<>();
                    result.put("totalStudents", totals.getT1());
                    result.put("totalRevenue", totals.getT2());
                    result.put("monthlyRevenue", totals.getT3());
                    result.put("dailyRevenue", totals.getT4());
                    result.put("totalProfessionals", totals.getT5());

                    result.put("monthlyGrowth", calculateGrowth(totals.getT3(), totals.getT6()));
                    result.put("dailyGrowth", calculateGrowth(totals.getT4(), totals.getT7()));
                    result.put("yearlyGrowth", calculateGrowth(totals.getT2(), totals.getT8()));

                    result.put("studentGrowth", 12.5);
                    result.put("professionalGrowth", 8.3);

                    result.putAll(railMetrics);

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getDashboardTotals",
                            duration, 200, "Dashboard totals retrieved", null, "");
                    return result;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getDashboardTotals",
                            duration, 500, "Error retrieving dashboard totals", e.getMessage(), null, null);
                    return Mono.just(Map.of("error", "Failed to retrieve dashboard data"));
                });
    }

    @Override
    public Mono<Map<String, Object>> getRevenueChartData(String range, Integer year, Integer quarter, Integer month) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("range=%s, year=%s, quarter=%s, month=%s", range, year, quarter, month);

        LoggingUtility.logInfo(logger, transactionId, "getRevenueChartData",
                null, 200, "Request received", requestPayload, null);

        Mono<Map<String, Object>> resultMono = switch (range.toLowerCase()) {
            case "yoy" -> getYearOverYearChartData()
                    .doOnSuccess(data -> {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "getRevenueChartData",
                                duration, 200, "Year-over-year chart data retrieved", requestPayload, "");
                    });
            case "year" -> getYearlyChartData(year)
                    .doOnSuccess(data -> {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "getRevenueChartData",
                                duration, 200, "Yearly chart data retrieved", requestPayload, "");
                    });
            case "quarter" -> getQuarterlyChartData(year, quarter)
                    .doOnSuccess(data -> {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "getRevenueChartData",
                                duration, 200, "Quarterly chart data retrieved", requestPayload, "");
                    });
            case "month" -> getMonthlyChartData(year, month)
                    .doOnSuccess(data -> {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "getRevenueChartData",
                                duration, 200, "Monthly chart data retrieved", requestPayload, "");
                    });
            default -> {
                long duration = System.currentTimeMillis() - startTime;
                LoggingUtility.logWarn(logger, transactionId, "getRevenueChartData",
                        duration, 400, "Invalid range specified", "Invalid range: " + range, requestPayload, null);
                yield Mono.just(Map.of("error", "Invalid range specified"));
            }
        };

        return resultMono.onErrorResume(e -> {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logError(logger, transactionId, "getRevenueChartData",
                    duration, 500, "Error retrieving chart data", e.getMessage(), requestPayload, null);
            return Mono.just(Map.of("error", "Failed to retrieve chart data"));
        });
    }

    @Override
    public Mono<Map<String, Object>> getRevenueStats() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getRevenueStats",
                null, 200, "Request received", null, null);

        return Mono.zip(
                getMonthlyRevenue(),
                getLastMonthRevenue(),
                getDailyRevenue(),
                getYesterdayRevenue(),
                getTotalRevenue(),
                getLastYearRevenue()
        ).map(tuple -> {
            Map<String, Object> result = new HashMap<>();

            // Current values
            result.put("currentMonth", tuple.getT1());
            result.put("currentDay", tuple.getT3());
            result.put("totalRevenue", tuple.getT5());

            // Growth calculations
            result.put("monthlyGrowth", calculateGrowth(tuple.getT1(), tuple.getT2()));
            result.put("dailyGrowth", calculateGrowth(tuple.getT3(), tuple.getT4()));
            result.put("yearlyGrowth", calculateGrowth(tuple.getT5(), tuple.getT6()));

            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logInfo(logger, transactionId, "getRevenueStats",
                    duration, 200, "Revenue stats retrieved", null, "");
            return result;
        })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getRevenueStats",
                            duration, 500, "Error retrieving revenue stats", e.getMessage(), null, null);
                    return Mono.just(Map.of("error", "Failed to retrieve revenue stats"));
                });
    }

    @Override
    public Mono<Map<String, Object>> getPaymentMethodTrend(Integer days) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        int d = days != null ? days : 30;

        LoggingUtility.logInfo(logger, transactionId, "getPaymentMethodTrend",
                null, 200, "Request received days=" + d, null, null);

        return coinTransactionRepository.findAll()
                .filter(tx -> isPurchaseRevenueTransaction(tx))
                .collectList()
                .map(list -> buildPaymentMethodTrend(list, d))
                .doOnSuccess(data -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getPaymentMethodTrend",
                            duration, 200, "Trend built", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getPaymentMethodTrend",
                            duration, 500, "Error", e.getMessage(), null, null);
                    return Mono.just(Map.of("error", "Failed to build payment method trend"));
                });
    }

    private Mono<Map<String, Object>> paymentRailMetricsMono() {
        return coinTransactionRepository.findAll()
                .collectList()
                .map(this::computePaymentRailMetrics);
    }

    /** Failed coin-purchase attempts (e.g. declined STK, Paystack failure). */
    private boolean isFailedCoinPurchase(CoinTransaction tx) {
        if (tx == null) {
            return false;
        }
        if (!"FAILED".equalsIgnoreCase(blankToEmpty(tx.getStatus()))) {
            return false;
        }
        return "DEBIT".equalsIgnoreCase(blankToEmpty(tx.getEntryType()));
    }

    /**
     * Coin purchases that count toward CARD / M-Pesa revenue (matches typical completed purchases).
     */
    private boolean isPurchaseRevenueTransaction(CoinTransaction tx) {
        if (tx == null || tx.getCreatedAt() == null) {
            return false;
        }
        if (!"DEBIT".equalsIgnoreCase(blankToEmpty(tx.getEntryType()))) {
            return false;
        }
        if (tx.getAmount() == null || tx.getAmount() <= 0 || !Double.isFinite(tx.getAmount())) {
            return false;
        }
        return "COMPLETED".equalsIgnoreCase(blankToEmpty(tx.getStatus()));
    }

    private static String blankToEmpty(String s) {
        return s == null ? "" : s.trim();
    }

    /**
     * Admin / dashboard revenue: {@code SUM(amount)} where {@code status = 'COMPLETED'} and
     * {@code entry_type = 'DEBIT'} (coin purchase money in). Null amounts count as 0 like SQL {@code SUM}.
     */
    private boolean isCompletedDebitForRevenue(CoinTransaction tx) {
        if (tx == null) {
            return false;
        }
        if (!"DEBIT".equalsIgnoreCase(blankToEmpty(tx.getEntryType()))) {
            return false;
        }
        return "COMPLETED".equalsIgnoreCase(blankToEmpty(tx.getStatus()));
    }

    private static double revenueAmount(CoinTransaction tx) {
        Double a = tx.getAmount();
        if (a == null || !Double.isFinite(a)) {
            return 0.0;
        }
        return a;
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    /**
     * CARD (Paystack) vs M-Pesa; legacy rows use provider fields when payment_method is null.
     */
    private String resolvePaymentRail(CoinTransaction tx) {
        String pm = tx.getPaymentMethod();
        if (hasText(pm)) {
            String u = pm.trim().toUpperCase(Locale.ROOT);
            if ("MPESA".equals(u)) {
                return "MPESA";
            }
            if ("CARD".equals(u) || "PAYSTACK".equals(u)) {
                return "CARD";
            }
            return "OTHER";
        }
        if (hasText(tx.getMpesaCheckoutRequestId()) || hasText(tx.getMpesaReceiptNumber())) {
            return "MPESA";
        }
        if (hasText(tx.getPaystackReference()) || hasText(tx.getStripePaymentId())) {
            return "CARD";
        }
        return "OTHER";
    }

    private Map<String, Object> computePaymentRailMetrics(List<CoinTransaction> all) {
        LocalDate today = LocalDate.now();
        double lifeCard = 0.0;
        double lifeMpesa = 0.0;
        long lifeCardC = 0;
        long lifeMpesaC = 0;
        double dayCard = 0.0;
        double dayMpesa = 0.0;
        long dayCardC = 0;
        long dayMpesaC = 0;
        long dayFailed = 0;
        long lifetimeFailed = 0;

        for (CoinTransaction tx : all) {
            if (tx == null || tx.getCreatedAt() == null) {
                continue;
            }
            if (isFailedCoinPurchase(tx)) {
                lifetimeFailed++;
                if (tx.getCreatedAt().toLocalDate().equals(today)) {
                    dayFailed++;
                }
                continue;
            }
            if (!isPurchaseRevenueTransaction(tx)) {
                continue;
            }
            String rail = resolvePaymentRail(tx);
            if (!"CARD".equals(rail) && !"MPESA".equals(rail)) {
                continue;
            }
            double a = tx.getAmount();
            LocalDate day = tx.getCreatedAt().toLocalDate();
            if ("CARD".equals(rail)) {
                lifeCard += a;
                lifeCardC++;
                if (day.equals(today)) {
                    dayCard += a;
                    dayCardC++;
                }
            } else {
                lifeMpesa += a;
                lifeMpesaC++;
                if (day.equals(today)) {
                    dayMpesa += a;
                    dayMpesaC++;
                }
            }
        }

        Map<String, Object> m = new HashMap<>();
        m.put("cardTotalRevenue", lifeCard);
        m.put("mpesaTotalRevenue", lifeMpesa);
        m.put("cardLifetimeTransactions", lifeCardC);
        m.put("mpesaLifetimeTransactions", lifeMpesaC);
        m.put("dailyCardRevenue", dayCard);
        m.put("dailyMpesaRevenue", dayMpesa);
        m.put("dailyCardTransactions", dayCardC);
        m.put("dailyMpesaTransactions", dayMpesaC);
        m.put("dailyFailedTransactions", dayFailed);
        m.put("failedTransactionsLifetime", lifetimeFailed);
        return m;
    }

    private Map<String, Object> buildPaymentMethodTrend(List<CoinTransaction> txs, int dayCount) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays((long) dayCount - 1);

        Map<LocalDate, double[]> bucket = new LinkedHashMap<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            bucket.put(d, new double[]{0.0, 0.0});
        }

        for (CoinTransaction tx : txs) {
            String rail = resolvePaymentRail(tx);
            if (!"CARD".equals(rail) && !"MPESA".equals(rail)) {
                continue;
            }
            LocalDate day = tx.getCreatedAt().toLocalDate();
            if (day.isBefore(start) || day.isAfter(end)) {
                continue;
            }
            double[] arr = bucket.get(day);
            if (arr == null) {
                continue;
            }
            double a = tx.getAmount() == null ? 0.0 : tx.getAmount();
            if ("CARD".equals(rail)) {
                arr[0] += a;
            } else {
                arr[1] += a;
            }
        }

        List<String> labels = new ArrayList<>();
        List<Double> cardRevenue = new ArrayList<>();
        List<Double> mpesaRevenue = new ArrayList<>();
        List<Double> cardPercent = new ArrayList<>();
        List<Double> mpesaPercent = new ArrayList<>();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d", Locale.US);
        for (Map.Entry<LocalDate, double[]> e : bucket.entrySet()) {
            LocalDate date = e.getKey();
            double card = e.getValue()[0];
            double mpesa = e.getValue()[1];
            double total = card + mpesa;
            labels.add(date.format(fmt));
            cardRevenue.add(card);
            mpesaRevenue.add(mpesa);
            if (total <= 0) {
                cardPercent.add(0.0);
                mpesaPercent.add(0.0);
            } else {
                cardPercent.add(round2((card / total) * 100.0));
                mpesaPercent.add(round2((mpesa / total) * 100.0));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("cardRevenue", cardRevenue);
        result.put("mpesaRevenue", mpesaRevenue);
        result.put("cardPercent", cardPercent);
        result.put("mpesaPercent", mpesaPercent);
        result.put("dayCount", dayCount);
        return result;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // Year-over-Year comparison (last 5 years)
    private Mono<Map<String, Object>> getYearOverYearChartData() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getYearOverYearChartData",
                null, 200, "Processing year-over-year chart data", null, null);

        int currentYear = Year.now().getValue();
        List<Integer> years = IntStream.rangeClosed(currentYear - 4, currentYear)
                .boxed()
                .collect(Collectors.toList());

        return Flux.fromIterable(years)
                .flatMap(this::getYearlyRevenue)
                .collectList()
                .map(yearRevenues -> {
                    Map<String, Double> yearlyRevenue = new LinkedHashMap<>();
                    List<String> labels = new ArrayList<>();
                    List<Double> data = new ArrayList<>();

                    for (int i = 0; i < years.size(); i++) {
                        String yearLabel = years.get(i).toString();
                        Double revenue = i < yearRevenues.size() ? yearRevenues.get(i) : 0.0;
                        
                        yearlyRevenue.put(yearLabel, revenue);
                        labels.add(yearLabel);
                        data.add(revenue);
                    }

                    Map<String, Object> result = Map.of(
                            "labels", labels,
                            "data", data,
                            "total", data.stream().reduce(0.0, Double::sum)
                    );

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getYearOverYearChartData",
                            duration, 200, "Year-over-year chart data processed", null, "");
                    return result;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getYearOverYearChartData",
                            duration, 500, "Error processing year-over-year chart data", e.getMessage(), null, null);
                    return Mono.just(Map.of("error", "Failed to process year-over-year chart data"));
                });
    }

    // Get yearly revenue for a specific year
    private Mono<Double> getYearlyRevenue(Integer year) {
        LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(tx -> !tx.getCreatedAt().isBefore(start) && !tx.getCreatedAt().isAfter(end))
                .map(DashboardServiceImpl::revenueAmount)
                .reduce(0.0, Double::sum);
    }

    // Updated yearly chart data with specific year
    private Mono<Map<String, Object>> getYearlyChartData(Integer year) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getYearlyChartData",
                null, 200, "Processing yearly chart data for year: " + year, null, null);

        int targetYear = year != null ? year : Year.now().getValue();
        LocalDateTime start = LocalDateTime.of(targetYear, 1, 1, 0, 0, 0);
        LocalDateTime end = LocalDateTime.of(targetYear, 12, 31, 23, 59, 59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(tx -> !tx.getCreatedAt().isBefore(start) && !tx.getCreatedAt().isAfter(end))
                .collectList()
                .map(transactions -> {
                    Map<String, Double> quarterlyRevenue = new LinkedHashMap<>();
                    
                    // Initialize quarters
                    for (int q = 1; q <= 4; q++) {
                        quarterlyRevenue.put("Q" + q, 0.0);
                    }

                    // Group by quarter
                    transactions.forEach(tx -> {
                        int month = tx.getCreatedAt().getMonthValue();
                        int quarter = (month - 1) / 3 + 1;
                        String quarterKey = "Q" + quarter;
                        quarterlyRevenue.merge(quarterKey, revenueAmount(tx), Double::sum);
                    });

                    Map<String, Object> result = Map.of(
                            "labels", new ArrayList<>(quarterlyRevenue.keySet()),
                            "data", new ArrayList<>(quarterlyRevenue.values()),
                            "total", quarterlyRevenue.values().stream().reduce(0.0, Double::sum)
                    );

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getYearlyChartData",
                            duration, 200, "Yearly chart data processed for year: " + targetYear, null, "");
                    return result;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getYearlyChartData",
                            duration, 500, "Error processing yearly chart data", e.getMessage(), null, null);
                    return Mono.just(Map.of("error", "Failed to process yearly chart data"));
                });
    }

    // Updated quarterly chart data with specific year and quarter
    private Mono<Map<String, Object>> getQuarterlyChartData(Integer year, Integer quarter) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getQuarterlyChartData",
                null, 200, "Processing quarterly chart data for year: " + year + ", quarter: " + quarter, null, null);

        int targetYear = year != null ? year : Year.now().getValue();
        int targetQuarter = quarter != null ? quarter : ((LocalDate.now().getMonthValue() - 1) / 3) + 1;

        LocalDateTime start = LocalDateTime.of(targetYear, (targetQuarter - 1) * 3 + 1, 1, 0, 0, 0);
        LocalDateTime end = start.plusMonths(3).minusDays(1).withHour(23).withMinute(59).withSecond(59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(tx -> !tx.getCreatedAt().isBefore(start) && !tx.getCreatedAt().isAfter(end))
                .collectList()
                .map(transactions -> {
                    Map<String, Double> monthlyRevenue = new LinkedHashMap<>();

                    // Initialize months for the quarter
                    String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                    
                    for (int i = 0; i < 3; i++) {
                        int monthIndex = (targetQuarter - 1) * 3 + i;
                        monthlyRevenue.put(monthNames[monthIndex], 0.0);
                    }

                    // Group by month
                    transactions.forEach(tx -> {
                        int month = tx.getCreatedAt().getMonthValue();
                        String monthKey = monthNames[month - 1];
                        monthlyRevenue.merge(monthKey, revenueAmount(tx), Double::sum);
                    });

                    Map<String, Object> result = Map.of(
                            "labels", new ArrayList<>(monthlyRevenue.keySet()),
                            "data", new ArrayList<>(monthlyRevenue.values()),
                            "total", monthlyRevenue.values().stream().reduce(0.0, Double::sum)
                    );

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getQuarterlyChartData",
                            duration, 200, "Quarterly chart data processed", null, "");
                    return result;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getQuarterlyChartData",
                            duration, 500, "Error processing quarterly chart data", e.getMessage(), null, null);
                    return Mono.just(Map.of("error", "Failed to process quarterly chart data"));
                });
    }

    // Updated monthly chart data with specific year and month
    private Mono<Map<String, Object>> getMonthlyChartData(Integer year, Integer month) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getMonthlyChartData",
                null, 200, "Processing monthly chart data for year: " + year + ", month: " + month, null, null);

        int targetYear = year != null ? year : Year.now().getValue();
        int targetMonth = month != null ? month : LocalDate.now().getMonthValue();

        LocalDateTime start = LocalDateTime.of(targetYear, targetMonth, 1, 0, 0, 0);
        LocalDateTime end = start.withDayOfMonth(start.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(tx -> !tx.getCreatedAt().isBefore(start) && !tx.getCreatedAt().isAfter(end))
                .collectList()
                .map(transactions -> {
                    Map<String, Double> weeklyRevenue = new LinkedHashMap<>();
                    
                    // Calculate weeks in the month
                    LocalDate firstDay = start.toLocalDate();
                    LocalDate lastDay = end.toLocalDate();
                    
                    int weekNumber = 1;
                    LocalDate currentWeekStart = firstDay;
                    
                    while (!currentWeekStart.isAfter(lastDay)) {
                        LocalDate currentWeekEnd = currentWeekStart.plusDays(6);
                        if (currentWeekEnd.isAfter(lastDay)) {
                            currentWeekEnd = lastDay;
                        }
                        
                        String weekKey = "Week " + weekNumber;
                        weeklyRevenue.put(weekKey, 0.0);
                        
                        // Create final copies for use in lambda
                        final LocalDate weekStart = currentWeekStart;
                        final LocalDate weekEnd = currentWeekEnd;
                        
                        // Calculate revenue for this week
                        double weekRevenue = transactions.stream()
                                .filter(tx -> {
                                    LocalDate txDate = tx.getCreatedAt().toLocalDate();
                                    return !txDate.isBefore(weekStart) && !txDate.isAfter(weekEnd);
                                })
                                .mapToDouble(DashboardServiceImpl::revenueAmount)
                                .sum();
                        
                        weeklyRevenue.put(weekKey, weekRevenue);
                        
                        currentWeekStart = currentWeekEnd.plusDays(1);
                        weekNumber++;
                    }

                    Map<String, Object> result = Map.of(
                            "labels", new ArrayList<>(weeklyRevenue.keySet()),
                            "data", new ArrayList<>(weeklyRevenue.values()),
                            "total", weeklyRevenue.values().stream().reduce(0.0, Double::sum)
                    );

                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getMonthlyChartData",
                            duration, 200, "Monthly chart data processed", null, "");
                    return result;
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getMonthlyChartData",
                            duration, 500, "Error processing monthly chart data", e.getMessage(), null, null);
                    return Mono.just(Map.of("error", "Failed to process monthly chart data"));
                });
    }

    // Original methods with logging
    public Mono<Long> getTotalStudents() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getTotalStudents",
                null, 200, "Counting total students", null, null);

        return roleRepository.findByRoleName("ROLE_STUDENT")
                .flatMapMany(role -> userRepository.findByRoleId(role.getRoleId()))
                .count()
                .doOnSuccess(count -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getTotalStudents",
                            duration, 200, "Total students counted", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getTotalStudents",
                            duration, 500, "Error counting students", e.getMessage(), null, null);
                    return Mono.just(0L);
                });
    }

    public Mono<Double> getTotalRevenue() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getTotalRevenue",
                null, 200, "Calculating total revenue", null, null);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .map(DashboardServiceImpl::revenueAmount)
                .reduce(0.0, Double::sum)
                .doOnSuccess(total -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getTotalRevenue",
                            duration, 200, "Total revenue calculated", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getTotalRevenue",
                            duration, 500, "Error calculating total revenue", e.getMessage(), null, null);
                    return Mono.just(0.0);
                });
    }

    public Mono<Double> getMonthlyRevenue() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getMonthlyRevenue",
                null, 200, "Calculating monthly revenue", null, null);

        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = YearMonth.now().atEndOfMonth().atTime(23, 59, 59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(transaction -> !transaction.getCreatedAt().isBefore(startOfMonth) &&
                        !transaction.getCreatedAt().isAfter(endOfMonth))
                .map(DashboardServiceImpl::revenueAmount)
                .reduce(0.0, Double::sum)
                .doOnSuccess(total -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getMonthlyRevenue",
                            duration, 200, "Monthly revenue calculated", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getMonthlyRevenue",
                            duration, 500, "Error calculating monthly revenue", e.getMessage(), null, null);
                    return Mono.just(0.0);
                });
    }

    public Mono<Double> getDailyRevenue() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getDailyRevenue",
                null, 200, "Calculating daily revenue", null, null);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(transaction -> !transaction.getCreatedAt().isBefore(startOfDay) &&
                        !transaction.getCreatedAt().isAfter(endOfDay))
                .map(DashboardServiceImpl::revenueAmount)
                .reduce(0.0, Double::sum)
                .doOnSuccess(total -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getDailyRevenue",
                            duration, 200, "Daily revenue calculated", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getDailyRevenue",
                            duration, 500, "Error calculating daily revenue", e.getMessage(), null, null);
                    return Mono.just(0.0);
                });
    }

    public Mono<Long> getTotalProfessionals() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getTotalProfessionals",
                null, 200, "Counting total professionals", null, null);

        return roleRepository.findByRoleName("ROLE_TUTOR")
                .flatMapMany(role -> userRepository.findByRoleId(role.getRoleId()))
                .count()
                .doOnSuccess(count -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getTotalProfessionals",
                            duration, 200, "Total professionals counted", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getTotalProfessionals",
                            duration, 500, "Error counting professionals", e.getMessage(), null, null);
                    return Mono.just(0L);
                });
    }

    private Mono<Double> getLastMonthRevenue() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getLastMonthRevenue",
                null, 200, "Calculating last month revenue", null, null);

        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDateTime start = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime end = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(transaction -> !transaction.getCreatedAt().isBefore(start) &&
                        !transaction.getCreatedAt().isAfter(end))
                .map(DashboardServiceImpl::revenueAmount)
                .reduce(0.0, Double::sum)
                .doOnSuccess(total -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getLastMonthRevenue",
                            duration, 200, "Last month revenue calculated", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getLastMonthRevenue",
                            duration, 500, "Error calculating last month revenue", e.getMessage(), null, null);
                    return Mono.just(0.0);
                });
    }

    private Mono<Double> getYesterdayRevenue() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getYesterdayRevenue",
                null, 200, "Calculating yesterday revenue", null, null);

        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime start = yesterday.atStartOfDay();
        LocalDateTime end = yesterday.atTime(23, 59, 59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(transaction -> !transaction.getCreatedAt().isBefore(start) &&
                        !transaction.getCreatedAt().isAfter(end))
                .map(DashboardServiceImpl::revenueAmount)
                .reduce(0.0, Double::sum)
                .doOnSuccess(total -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getYesterdayRevenue",
                            duration, 200, "Yesterday revenue calculated", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getYesterdayRevenue",
                            duration, 500, "Error calculating yesterday revenue", e.getMessage(), null, null);
                    return Mono.just(0.0);
                });
    }

    private Mono<Double> getLastYearRevenue() {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        LoggingUtility.logInfo(logger, transactionId, "getLastYearRevenue",
                null, 200, "Calculating last year revenue", null, null);

        int lastYear = LocalDate.now().getYear() - 1;
        LocalDateTime start = LocalDate.of(lastYear, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(lastYear, 12, 31).atTime(23, 59, 59);

        return coinTransactionRepository.findAll()
                .filter(this::isCompletedDebitForRevenue)
                .filter(transaction -> !transaction.getCreatedAt().isBefore(start) &&
                        !transaction.getCreatedAt().isAfter(end))
                .map(DashboardServiceImpl::revenueAmount)
                .reduce(0.0, Double::sum)
                .doOnSuccess(total -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "getLastYearRevenue",
                            duration, 200, "Last year revenue calculated", null, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "getLastYearRevenue",
                            duration, 500, "Error calculating last year revenue", e.getMessage(), null, null);
                    return Mono.just(0.0);
                });
    }

    private double calculateGrowth(double current, double previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - previous) / previous) * 100;
    }
}