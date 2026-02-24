package com.bitedash.shared.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Event published when a user recharges their wallet
 * Used to trigger wallet recharge confirmation notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletRechargedEvent {
    private Long userId;
    private String userEmail;
    private String userName;
    private BigDecimal amount;
    private BigDecimal newBalance;
    private String transactionId;
}
