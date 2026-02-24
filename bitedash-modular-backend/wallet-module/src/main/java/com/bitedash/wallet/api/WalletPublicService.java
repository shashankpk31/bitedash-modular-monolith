package com.bitedash.wallet.api;

import com.bitedash.wallet.dto.response.UserWalletResponse;
import java.math.BigDecimal;

/**
 * Public API for wallet operations - used by other modules
 */
public interface WalletPublicService {

    /**
     * Initialize wallet for a new user
     */
    UserWalletResponse initWallet(Long userId);

    /**
     * Get wallet information by user ID
     */
    UserWalletResponse getWalletByUserId(Long userId);

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
     * Get current balance
     */
    BigDecimal getBalance(Long userId);
}
