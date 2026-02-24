package com.bitedash.order.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponse {
	private Long id;
	private Long orderId;
	private String previousStatus;
	private String newStatus;
	private Long changedBy;
	private String changedByRole;
	private String remarks;
	private LocalDateTime createdAt;
}
