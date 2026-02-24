package com.bitedash.menu.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PromotionRequest {
	private Long vendorId;
	private Long menuItemId;
	private String promotionType;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private BigDecimal pricePaid;
	private String status;

	public PromotionRequest() {
	}

	public PromotionRequest(Long vendorId, Long menuItemId, String promotionType,
							LocalDateTime startDate, LocalDateTime endDate, BigDecimal pricePaid) {
		this.vendorId = vendorId;
		this.menuItemId = menuItemId;
		this.promotionType = promotionType;
		this.startDate = startDate;
		this.endDate = endDate;
		this.pricePaid = pricePaid;
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

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
