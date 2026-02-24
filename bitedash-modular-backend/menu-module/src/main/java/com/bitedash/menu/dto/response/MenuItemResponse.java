package com.bitedash.menu.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MenuItemResponse {
	private Long id;
	private Long vendorId;
	private Long categoryId;
	private String categoryName;
	private String name;
	private String description;
	private BigDecimal price;
	private Boolean isAvailable;
	private Boolean isVeg;
	private Boolean isPromoted;
	private Integer promotionRank;
	private LocalDateTime promotionStartDate;
	private LocalDateTime promotionEndDate;
	private String promotionType;
	private String spiceLevel;
	private String dietaryTags;
	private Integer popularityScore;
	private Integer displayOrder;
	private Integer calories;
	private Integer preparationTimeMinutes;
	private String imageUrl;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public MenuItemResponse() {
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

	public Long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public Boolean getIsAvailable() {
		return isAvailable;
	}

	public void setIsAvailable(Boolean isAvailable) {
		this.isAvailable = isAvailable;
	}

	public Boolean getIsVeg() {
		return isVeg;
	}

	public void setIsVeg(Boolean isVeg) {
		this.isVeg = isVeg;
	}

	public Boolean getIsPromoted() {
		return isPromoted;
	}

	public void setIsPromoted(Boolean isPromoted) {
		this.isPromoted = isPromoted;
	}

	public Integer getPromotionRank() {
		return promotionRank;
	}

	public void setPromotionRank(Integer promotionRank) {
		this.promotionRank = promotionRank;
	}

	public LocalDateTime getPromotionStartDate() {
		return promotionStartDate;
	}

	public void setPromotionStartDate(LocalDateTime promotionStartDate) {
		this.promotionStartDate = promotionStartDate;
	}

	public LocalDateTime getPromotionEndDate() {
		return promotionEndDate;
	}

	public void setPromotionEndDate(LocalDateTime promotionEndDate) {
		this.promotionEndDate = promotionEndDate;
	}

	public String getPromotionType() {
		return promotionType;
	}

	public void setPromotionType(String promotionType) {
		this.promotionType = promotionType;
	}

	public String getSpiceLevel() {
		return spiceLevel;
	}

	public void setSpiceLevel(String spiceLevel) {
		this.spiceLevel = spiceLevel;
	}

	public String getDietaryTags() {
		return dietaryTags;
	}

	public void setDietaryTags(String dietaryTags) {
		this.dietaryTags = dietaryTags;
	}

	public Integer getPopularityScore() {
		return popularityScore;
	}

	public void setPopularityScore(Integer popularityScore) {
		this.popularityScore = popularityScore;
	}

	public Integer getDisplayOrder() {
		return displayOrder;
	}

	public void setDisplayOrder(Integer displayOrder) {
		this.displayOrder = displayOrder;
	}

	public Integer getCalories() {
		return calories;
	}

	public void setCalories(Integer calories) {
		this.calories = calories;
	}

	public Integer getPreparationTimeMinutes() {
		return preparationTimeMinutes;
	}

	public void setPreparationTimeMinutes(Integer preparationTimeMinutes) {
		this.preparationTimeMinutes = preparationTimeMinutes;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
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
