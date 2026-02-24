package com.bitedash.payment.api;

import com.bitedash.payment.dto.request.CommissionLogRequest;
import com.bitedash.payment.dto.response.PlatformRevenueStatsResponse;

/**
 * Public API for payment operations - used by other modules
 */
public interface PaymentPublicService {

    /**
     * Log commission from an order
     */
    void logCommission(CommissionLogRequest request);

    /**
     * Get overall revenue stats
     */
    PlatformRevenueStatsResponse getRevenueStats();
}
