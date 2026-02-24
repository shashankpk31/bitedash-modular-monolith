package com.bitedash.order.dto.request;

import java.math.BigDecimal;

public class OrderItemRequest {
	private Long menuItemId;
	private String menuItemName;
	private Integer quantity;
	private BigDecimal unitPrice;
	private String addonIds;
	private String customizations;
	private String notes;

	public OrderItemRequest() {
	}

	public Long getMenuItemId() {
		return menuItemId;
	}

	public void setMenuItemId(Long menuItemId) {
		this.menuItemId = menuItemId;
	}

	public String getMenuItemName() {
		return menuItemName;
	}

	public void setMenuItemName(String menuItemName) {
		this.menuItemName = menuItemName;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public BigDecimal getUnitPrice() {
		return unitPrice;
	}

	public void setUnitPrice(BigDecimal unitPrice) {
		this.unitPrice = unitPrice;
	}

	public String getAddonIds() {
		return addonIds;
	}

	public void setAddonIds(String addonIds) {
		this.addonIds = addonIds;
	}

	public String getCustomizations() {
		return customizations;
	}

	public void setCustomizations(String customizations) {
		this.customizations = customizations;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}
}
