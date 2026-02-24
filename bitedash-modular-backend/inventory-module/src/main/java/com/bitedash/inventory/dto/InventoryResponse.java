package com.bitedash.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
	private Long id;
	private String itemName;
	private Long cafeteriaId;
	private Long vendorId;
	private BigDecimal stockQuantity;
	private String unit;
	private BigDecimal minStockLevel;
	private BigDecimal maxStockLevel;
	private Integer reorderQuantity;
	private BigDecimal costPerUnit;
	private String supplierName;
	private String supplierContact;
	private LocalDateTime lastRestockedAt;
	private LocalDate expiryDate;
	private String storageLocation;
	private String stockStatus;
	private Boolean isAvailable;
	private Boolean needsReorder;
	private Boolean isExpired;
	private Boolean isExpiringSoon;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
