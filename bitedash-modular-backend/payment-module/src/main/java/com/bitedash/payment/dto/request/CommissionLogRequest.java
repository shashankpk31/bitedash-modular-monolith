package com.bitedash.payment.dto.request;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommissionLogRequest {
	private Long orderId;
	private BigDecimal amount;
	private Long vendorId;
	private Long organizationId;
}
