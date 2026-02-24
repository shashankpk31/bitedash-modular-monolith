package com.bitedash.wallet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionResponse {
	private Long id;
	private Long walletId;
	private BigDecimal amount;
	private BigDecimal balanceBefore;
	private BigDecimal balanceAfter;
	private String txnType;
	private Long referenceId;
	private String referenceType;
	private String status;
	private String description;
	private String providerReferenceId;
	private LocalDateTime createdAt;
}
