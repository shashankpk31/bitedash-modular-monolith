package com.bitedash.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequest {
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
	private LocalDate expiryDate;
	private String storageLocation;
}
