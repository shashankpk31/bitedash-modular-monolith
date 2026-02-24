package com.bitedash.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemRequest {
	private Long inventoryId;
	private String itemName;
	private BigDecimal quantity;
	private String unit;
	private BigDecimal unitCost;
}
