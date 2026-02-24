package com.bitedash.order.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderRequest {
	private Long vendorId;
	private Long cafeteriaId;
	private Long officeId;
	private BigDecimal totalAmount;
	private String orderType = "DINE_IN";
	private LocalDateTime scheduledTime;
	private String specialInstructions;
	private List<OrderItemRequest> items;

	public OrderRequest() {
	}

	public Long getVendorId() {
		return vendorId;
	}

	public void setVendorId(Long vendorId) {
		this.vendorId = vendorId;
	}

	public Long getCafeteriaId() {
		return cafeteriaId;
	}

	public void setCafeteriaId(Long cafeteriaId) {
		this.cafeteriaId = cafeteriaId;
	}

	public Long getOfficeId() {
		return officeId;
	}

	public void setOfficeId(Long officeId) {
		this.officeId = officeId;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getOrderType() {
		return orderType;
	}

	public void setOrderType(String orderType) {
		this.orderType = orderType;
	}

	public LocalDateTime getScheduledTime() {
		return scheduledTime;
	}

	public void setScheduledTime(LocalDateTime scheduledTime) {
		this.scheduledTime = scheduledTime;
	}

	public String getSpecialInstructions() {
		return specialInstructions;
	}

	public void setSpecialInstructions(String specialInstructions) {
		this.specialInstructions = specialInstructions;
	}

	public List<OrderItemRequest> getItems() {
		return items;
	}

	public void setItems(List<OrderItemRequest> items) {
		this.items = items;
	}
}
