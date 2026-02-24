package com.bitedash.shared.api.wallet;

import java.math.BigDecimal;

/**
 * Public API for wallet-module.
 * This interface is in shared-module to avoid circular dependencies.
 * Implementation is in wallet-module.
 */
public interface WalletPublicService {

    /**
     * Initialize wallet for a new user
     * @return true if successful, false if wallet already exists
     */
    boolean initWallet(Long userId);

    /**
     * Check if wallet exists for user
     */
    boolean walletExists(Long userId);

    /**
     * Get current balance
     */
    BigDecimal getBalance(Long userId);

    /**
     * Deduct balance from user's wallet
     * @return true if successful, false if insufficient balance
     */
    boolean deductBalance(Long userId, BigDecimal amount);

    /**
     * Add balance to user's wallet
     * @return true if successful
     */
    boolean addBalance(Long userId, BigDecimal amount);

    /**
     * Debit wallet for order payment with full transaction details
     * @param userId User ID
     * @param amount Amount to debit
     * @param orderId Order ID for reference
     * @param orderNumber Order number for description
     * @return true if successful
     * @throws RuntimeException if insufficient balance or wallet not found
     */
    boolean debitForOrder(Long userId, BigDecimal amount, Long orderId, String orderNumber);

    /**
     * Refund order payment back to wallet
     * @param userId User ID
     * @param amount Amount to refund
     * @param orderId Order ID for reference
     * @param orderNumber Order number for description
     * @return true if successful
     */
    boolean refundOrder(Long userId, BigDecimal amount, Long orderId, String orderNumber);
}
