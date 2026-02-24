package com.bitedash.wallet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserWalletResponse {
	private Long id;
	private Long userId;
	private BigDecimal balance;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
