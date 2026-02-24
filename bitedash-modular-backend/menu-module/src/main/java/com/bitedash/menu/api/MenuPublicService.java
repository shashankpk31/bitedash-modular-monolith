package com.bitedash.menu.api;

import com.bitedash.menu.dto.response.MenuItemResponse;

import java.util.List;

/**
 * Public API for Menu Module - used by other modules for cross-module communication
 */
public interface MenuPublicService {

	/**
	 * Get menu item by ID
	 * @param id Menu item ID
	 * @return MenuItemResponse
	 */
	MenuItemResponse getMenuItemById(Long id);

	/**
	 * Get all menu items for a cafeteria
	 * @param cafeteriaId Cafeteria ID
	 * @return List of MenuItemResponse
	 */
	List<MenuItemResponse> getMenuItemsByCafeteria(Long cafeteriaId);

	/**
	 * Get all menu items for a vendor
	 * @param vendorId Vendor ID
	 * @return List of MenuItemResponse
	 */
	List<MenuItemResponse> getMenuItemsByVendor(Long vendorId);

	/**
	 * Check if menu item exists
	 * @param menuItemId Menu item ID
	 * @return true if exists and not deleted
	 */
	boolean menuItemExists(Long menuItemId);

	/**
	 * Get active promoted items
	 * @return List of promoted MenuItemResponse
	 */
	List<MenuItemResponse> getActivePromotedItems();

	/**
	 * Get popular items (based on order count or rating)
	 * @return List of popular MenuItemResponse
	 */
	List<MenuItemResponse> getPopularItems();
}
