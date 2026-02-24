package com.bitedash.menu.dto.mapper;

import com.bitedash.menu.dto.request.CategoryRequest;
import com.bitedash.menu.dto.response.CategoryResponse;
import com.bitedash.menu.entity.Category;

import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

	public static CategoryResponse toResponse(Category category, boolean includeMenuItems) {
		if (category == null) {
			return null;
		}

		CategoryResponse response = new CategoryResponse();
		response.setId(category.getId());
		response.setVendorId(category.getVendorId());
		response.setName(category.getName());
		response.setDescription(category.getDescription());
		response.setDisplayOrder(category.getDisplayOrder());
		response.setIconUrl(category.getIconUrl());
		response.setIsFeatured(category.getIsFeatured());
		response.setCreatedAt(category.getCreatedAt());
		response.setUpdatedAt(category.getUpdatedAt());

		if (category.getMenuItems() != null) {
			response.setItemCount(category.getMenuItems().size());

			if (includeMenuItems) {
				response.setMenuItems(MenuItemMapper.toResponseList(category.getMenuItems()));
			}
		} else {
			response.setItemCount(0);
		}

		return response;
	}

	public static CategoryResponse toResponse(Category category) {
		return toResponse(category, false);
	}

	public static Category toEntity(CategoryRequest request) {
		if (request == null) {
			return null;
		}

		Category category = new Category();
		category.setVendorId(request.getVendorId());
		category.setName(request.getName());
		category.setDescription(request.getDescription());
		category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 999);
		category.setIconUrl(request.getIconUrl());
		category.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);

		return category;
	}

	public static void updateEntity(Category category, CategoryRequest request) {
		if (category == null || request == null) {
			return;
		}

		if (request.getName() != null) {
			category.setName(request.getName());
		}
		if (request.getDescription() != null) {
			category.setDescription(request.getDescription());
		}
		if (request.getDisplayOrder() != null) {
			category.setDisplayOrder(request.getDisplayOrder());
		}
		if (request.getIconUrl() != null) {
			category.setIconUrl(request.getIconUrl());
		}
		if (request.getIsFeatured() != null) {
			category.setIsFeatured(request.getIsFeatured());
		}
	}

	public static List<CategoryResponse> toResponseList(List<Category> categories, boolean includeMenuItems) {
		if (categories == null) {
			return null;
		}

		return categories.stream()
				.map(cat -> toResponse(cat, includeMenuItems))
				.collect(Collectors.toList());
	}

	public static List<CategoryResponse> toResponseList(List<Category> categories) {
		return toResponseList(categories, false);
	}
}
