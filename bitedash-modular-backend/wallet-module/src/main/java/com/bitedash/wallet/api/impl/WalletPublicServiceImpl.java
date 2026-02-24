package com.bitedash.wallet.api.impl;

import com.bitedash.shared.api.wallet.WalletPublicService;
import com.bitedash.wallet.dto.response.UserWalletResponse;
import com.bitedash.wallet.service.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WalletPublicServiceImpl implements WalletPublicService {

    private static final Logger log = LoggerFactory.getLogger(WalletPublicServiceImpl.class);

    @Autowired
    private WalletService walletService;

    @Override
    public boolean initWallet(Long userId) {
        try {
            walletService.initWallet(userId);
            return true;
        } catch (Exception e) {
            log.error("Failed to initialize wallet for user {}: {}", userId, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean walletExists(Long userId) {
        try {
            walletService.getWalletByUserId(userId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public BigDecimal getBalance(Long userId) {
        try {
            return walletService.getBalance(userId);
        } catch (Exception e) {
            log.error("Failed to get balance for user {}: {}", userId, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    @Override
    public boolean deductBalance(Long userId, BigDecimal amount) {
        try {
            walletService.debit(userId, amount, "Balance deduction", null, null);
            return true;
        } catch (Exception e) {
            log.error("Failed to deduct balance for user {}: {}", userId, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean addBalance(Long userId, BigDecimal amount) {
        try {
            walletService.credit(userId, amount, "Balance addition", null, null);
            return true;
        } catch (Exception e) {
            log.error("Failed to add balance for user {}: {}", userId, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean debitForOrder(Long userId, BigDecimal amount, Long orderId, String orderNumber) {
        try {
            String description = "Payment for Order #" + orderNumber;
            walletService.debit(userId, amount, description, orderId, "ORDER");
            log.info("Successfully debited {} from user {} wallet for order {}", amount, userId, orderNumber);
            return true;
        } catch (RuntimeException e) {
            log.error("Failed to debit wallet for order {}: {}", orderNumber, e.getMessage());
            throw e; // Re-throw to allow order creation rollback
        } catch (Exception e) {
            log.error("Unexpected error debiting wallet for order {}: {}", orderNumber, e.getMessage());
            throw new RuntimeException("Wallet debit failed: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean refundOrder(Long userId, BigDecimal amount, Long orderId, String orderNumber) {
        try {
            String description = "Refund for Order #" + orderNumber;
            walletService.credit(userId, amount, description, orderId, "ORDER_REFUND");
            log.info("Successfully refunded {} to user {} wallet for order {}", amount, userId, orderNumber);
            return true;
        } catch (Exception e) {
            log.error("Failed to refund wallet for order {}: {}", orderNumber, e.getMessage());
            return false;
        }
    }
}
