package com.bitedash.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {
	private Long cafeteriaId;
	private String supplierName;
	private String supplierContact;
	private LocalDate expectedDeliveryDate;
	private String remarks;
	private List<PurchaseOrderItemRequest> items = new ArrayList<>();
}
