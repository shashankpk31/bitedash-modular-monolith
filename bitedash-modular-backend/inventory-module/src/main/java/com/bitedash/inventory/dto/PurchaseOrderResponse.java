package com.bitedash.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
	private Long id;
	private String poNumber;
	private Long cafeteriaId;
	private String supplierName;
	private String supplierContact;
	private LocalDate orderDate;
	private LocalDate expectedDeliveryDate;
	private LocalDate actualDeliveryDate;
	private BigDecimal totalAmount;
	private String status;
	private Long approvedBy;
	private LocalDateTime approvedAt;
	private String createdBy;
	private String remarks;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private List<PurchaseOrderItemResponse> items;
}
