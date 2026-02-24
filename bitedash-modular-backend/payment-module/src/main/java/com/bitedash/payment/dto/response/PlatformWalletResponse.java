package com.bitedash.payment.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatformWalletResponse {
	private Long id;
	private BigDecimal balance;
	private BigDecimal totalCommissionEarned;
	private BigDecimal totalGatewayMarkupEarned;
	private BigDecimal totalPromotionSpent;
	private LocalDateTime updatedAt;
}
