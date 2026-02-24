package com.bitedash.menu.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PromotionResponse {
	private Long id;
	private Long vendorId;
	private Long menuItemId;
	private String menuItemName;
	private String promotionType;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private BigDecimal pricePaid;
	private Integer impressions;
	private Integer clicks;
	private Integer ordersGenerated;
	private String status;
	private Double clickThroughRate;
	private Double conversionRate;
	private Double costPerOrder;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public PromotionResponse() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getVendorId() {
		return vendorId;
	}

	public void setVendorId(Long vendorId) {
		this.vendorId = vendorId;
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

	public String getPromotionType() {
		return promotionType;
	}

	public void setPromotionType(String promotionType) {
		this.promotionType = promotionType;
	}

	public LocalDateTime getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDateTime startDate) {
		this.startDate = startDate;
	}

	public LocalDateTime getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDateTime endDate) {
		this.endDate = endDate;
	}

	public BigDecimal getPricePaid() {
		return pricePaid;
	}

	public void setPricePaid(BigDecimal pricePaid) {
		this.pricePaid = pricePaid;
	}

	public Integer getImpressions() {
		return impressions;
	}

	public void setImpressions(Integer impressions) {
		this.impressions = impressions;
	}

	public Integer getClicks() {
		return clicks;
	}

	public void setClicks(Integer clicks) {
		this.clicks = clicks;
	}

	public Integer getOrdersGenerated() {
		return ordersGenerated;
	}

	public void setOrdersGenerated(Integer ordersGenerated) {
		this.ordersGenerated = ordersGenerated;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Double getClickThroughRate() {
		return clickThroughRate;
	}

	public void setClickThroughRate(Double clickThroughRate) {
		this.clickThroughRate = clickThroughRate;
	}

	public Double getConversionRate() {
		return conversionRate;
	}

	public void setConversionRate(Double conversionRate) {
		this.conversionRate = conversionRate;
	}

	public Double getCostPerOrder() {
		return costPerOrder;
	}

	public void setCostPerOrder(Double costPerOrder) {
		this.costPerOrder = costPerOrder;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
