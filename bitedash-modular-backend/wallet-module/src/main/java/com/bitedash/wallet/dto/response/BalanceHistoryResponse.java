package com.bitedash.wallet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BalanceHistoryResponse {
	private LocalDateTime timestamp;
	private BigDecimal balance;
	private BigDecimal change;
	private String txnType;
	private String description;
}
