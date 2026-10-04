package com.albert.microservices.teaching.marketplace.requests;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public  class CoinPriceCalculation {
    private Integer coins;
    private BigDecimal basePricePerCoin;
    private BigDecimal baseTotalPrice;
    private Integer discountMinCoins;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
}