package com.albert.microservices.teaching.marketplace.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table("coin_wallets")
public class CoinWallet {
    @Id
    private Integer id;
    private Integer userId;
    private Double coinBalance;
    private String walletUuid = UUID.randomUUID().toString();

    public CoinWallet(Integer userId, Double coinBalance) {
        this.userId = userId;
        this.coinBalance = coinBalance;
    }
    public synchronized void addCoins(int coins) {
        this.coinBalance += coins;
    }

    public synchronized void deductCoins(int coins) {
        if (coins <= 0) {
            throw new IllegalArgumentException("Coins to deduct must be positive");
        }
        if (this.coinBalance < coins) {
            throw new IllegalStateException("Insufficient coin balance");
        }
        this.coinBalance -= coins;
    }
}