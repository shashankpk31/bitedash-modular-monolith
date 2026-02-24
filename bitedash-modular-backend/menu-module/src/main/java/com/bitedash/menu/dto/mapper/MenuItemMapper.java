package com.bitedash.menu.dto.mapper;

import com.bitedash.menu.dto.request.MenuItemRequest;
import com.bitedash.menu.dto.response.MenuItemResponse;
import com.bitedash.menu.entity.MenuItem;

import java.util.List;
import java.util.stream.Collectors;

public class MenuItemMapper {

	public static MenuItemResponse toResponse(MenuItem menuItem) {
		if (menuItem == null) {
			return null;
		}

		MenuItemResponse response = new MenuItemResponse();
		response.setId(menuItem.getId());
		response.setVendorId(menuItem.getVendorId());

		if (menuItem.getCategory() != null) {
			response.setCategoryId(menuItem.getCategory().getId());
			response.setCategoryName(menuItem.getCategory().getName());
		}

		response.setName(menuItem.getName());
		response.setDescription(menuItem.getDescription());
		response.setPrice(menuItem.getPrice());
		response.setIsAvailable(menuItem.getIsAvailable());
		response.setIsVeg(menuItem.getIsVeg());
		response.setIsPromoted(menuItem.getIsPromoted());
		response.setPromotionRank(menuItem.getPromotionRank());
		response.setPromotionStartDate(menuItem.getPromotionStartDate());
		response.setPromotionEndDate(menuItem.getPromotionEndDate());
		response.setPromotionType(menuItem.getPromotionType());
		response.setSpiceLevel(menuItem.getSpiceLevel());
		response.setDietaryTags(menuItem.getDietaryTags());
		response.setPopularityScore(menuItem.getPopularityScore());
		response.setDisplayOrder(menuItem.getDisplayOrder());
		response.setCalories(menuItem.getCalories());
		response.setPreparationTimeMinutes(menuItem.getPreparationTimeMinutes());
		response.setImageUrl(menuItem.getImageUrl());
		response.setCreatedAt(menuItem.getCreatedAt());
		response.setUpdatedAt(menuItem.getUpdatedAt());

		return response;
	}

	public static MenuItem toEntity(MenuItemRequest request) {
		if (request == null) {
			return null;
		}

		MenuItem menuItem = new MenuItem();
		menuItem.setVendorId(request.getVendorId());

		menuItem.setName(request.getName());
		menuItem.setDescription(request.getDescription());
		menuItem.setPrice(request.getPrice());
		menuItem.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
		menuItem.setIsVeg(request.getIsVeg() != null ? request.getIsVeg() : true);
		menuItem.setIsPromoted(request.getIsPromoted() != null ? request.getIsPromoted() : false);
		menuItem.setPromotionRank(request.getPromotionRank() != null ? request.getPromotionRank() : 999);
		menuItem.setPromotionStartDate(request.getPromotionStartDate());
		menuItem.setPromotionEndDate(request.getPromotionEndDate());
		menuItem.setPromotionType(request.getPromotionType());
		menuItem.setSpiceLevel(request.getSpiceLevel());
		menuItem.setDietaryTags(request.getDietaryTags());
		menuItem.setPopularityScore(request.getPopularityScore() != null ? request.getPopularityScore() : 0);
		menuItem.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 999);
		menuItem.setCalories(request.getCalories());
		menuItem.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
		menuItem.setImageUrl(request.getImageUrl());

		return menuItem;
	}

	public static void updateEntity(MenuItem menuItem, MenuItemRequest request) {
		if (menuItem == null || request == null) {
			return;
		}

		if (request.getName() != null) {
			menuItem.setName(request.getName());
		}
		if (request.getDescription() != null) {
			menuItem.setDescription(request.getDescription());
		}
		if (request.getPrice() != null) {
			menuItem.setPrice(request.getPrice());
		}
		if (request.getIsAvailable() != null) {
			menuItem.setIsAvailable(request.getIsAvailable());
		}
		if (request.getIsVeg() != null) {
			menuItem.setIsVeg(request.getIsVeg());
		}
		if (request.getIsPromoted() != null) {
			menuItem.setIsPromoted(request.getIsPromoted());
		}
		if (request.getPromotionRank() != null) {
			menuItem.setPromotionRank(request.getPromotionRank());
		}
		if (request.getPromotionStartDate() != null) {
			menuItem.setPromotionStartDate(request.getPromotionStartDate());
		}
		if (request.getPromotionEndDate() != null) {
			menuItem.setPromotionEndDate(request.getPromotionEndDate());
		}
		if (request.getPromotionType() != null) {
			menuItem.setPromotionType(request.getPromotionType());
		}
		if (request.getSpiceLevel() != null) {
			menuItem.setSpiceLevel(request.getSpiceLevel());
		}
		if (request.getDietaryTags() != null) {
			menuItem.setDietaryTags(request.getDietaryTags());
		}
		if (request.getPopularityScore() != null) {
			menuItem.setPopularityScore(request.getPopularityScore());
		}
		if (request.getDisplayOrder() != null) {
			menuItem.setDisplayOrder(request.getDisplayOrder());
		}
		if (request.getCalories() != null) {
			menuItem.setCalories(request.getCalories());
		}
		if (request.getPreparationTimeMinutes() != null) {
			menuItem.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
		}
		if (request.getImageUrl() != null) {
			menuItem.setImageUrl(request.getImageUrl());
		}
	}

	public static List<MenuItemResponse> toResponseList(List<MenuItem> menuItems) {
		if (menuItems == null) {
			return null;
		}

		return menuItems.stream()
				.map(MenuItemMapper::toResponse)
				.collect(Collectors.toList());
	}
}
