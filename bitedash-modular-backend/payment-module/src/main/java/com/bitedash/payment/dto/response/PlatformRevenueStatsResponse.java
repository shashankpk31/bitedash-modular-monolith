package com.bitedash.payment.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatformRevenueStatsResponse {
	private BigDecimal totalRevenue;
	private BigDecimal commissionRevenue;
	private BigDecimal gatewayMarkupRevenue;
	private BigDecimal promotionRevenue;
	private BigDecimal subscriptionRevenue;
	private Integer totalOrders;
	private Integer totalTransactions;
	private LocalDateTime periodStart;
	private LocalDateTime periodEnd;
}
