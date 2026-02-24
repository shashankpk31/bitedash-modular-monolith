package com.bitedash.shared.api.payment;

import java.math.BigDecimal;

/**
 * Public API for payment-module.
 * This interface is in shared-module to avoid circular dependencies.
 * Implementation is in payment-module.
 */
public interface PaymentPublicService {

    /**
     * Log commission from an order
     */
    void logCommission(Long orderId, BigDecimal amount, Long vendorId, Long organizationId);
}
