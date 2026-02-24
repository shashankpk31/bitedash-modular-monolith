package com.bitedash.payment.api.impl;

import com.bitedash.payment.dto.request.CommissionLogRequest;
import com.bitedash.payment.dto.response.PlatformRevenueStatsResponse;
import com.bitedash.payment.service.PlatformRevenueService;
import com.bitedash.shared.api.payment.PaymentPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PaymentPublicServiceImpl implements PaymentPublicService {

    @Autowired
    private PlatformRevenueService platformRevenueService;

    @Override
    public void logCommission(Long orderId, BigDecimal amount, Long vendorId, Long organizationId) {
        CommissionLogRequest request = new CommissionLogRequest(orderId, amount, vendorId, organizationId);
        platformRevenueService.logCommission(request);
    }

    // ===== Legacy method for internal use (using full DTO) =====

    public void logCommission(CommissionLogRequest request) {
        platformRevenueService.logCommission(request);
    }

    public PlatformRevenueStatsResponse getRevenueStats() {
        return platformRevenueService.getOverallRevenueStats();
    }
}
