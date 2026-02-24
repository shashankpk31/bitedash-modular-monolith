package com.bitedash.menu.controller;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.enums.Role;
import com.bitedash.menu.dto.request.CategoryRequest;
import com.bitedash.menu.dto.request.MenuItemRequest;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.menu.dto.response.CategoryResponse;
import com.bitedash.menu.dto.response.MenuItemResponse;
import com.bitedash.menu.service.MenuService;
import com.bitedash.shared.util.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menus")  // Changed from /menu to /menus to match microservices API
public class MenuController {

	private static final Logger log = LoggerFactory.getLogger(MenuController.class);

	@Autowired
	private MenuService menuService;

	/**
	 * Helper method to get current user ID from context (typically vendorId for this controller)
	 */
	private Long getCurrentUserId() {
		return UserContext.get().userId();
	}

	@GetMapping("/promoted")
	public ResponseEntity<ApiResponse> getPromotedItems() {
		try {
			log.info("Fetching promoted menu items");
			List<MenuItemResponse> items = menuService.getActivePromotedItems();
			return ResponseEntity.ok(new ApiResponse(true, "Promoted items fetched successfully", items));
		} catch (Exception e) {
			log.error("Error fetching promoted items: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to fetch promoted items: " + e.getMessage(), null));
		}
	}

	@GetMapping("/popular")
	public ResponseEntity<ApiResponse> getPopularItems() {
		try {
			log.info("Fetching popular menu items");
			List<MenuItemResponse> items = menuService.getPopularItems();
			return ResponseEntity.ok(new ApiResponse(true, "Popular items fetched successfully", items));
		} catch (Exception e) {
			log.error("Error fetching popular items: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to fetch popular items: " + e.getMessage(), null));
		}
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse> searchMenuItems(@RequestParam String keyword) {
		try {
			log.info("Searching menu items with keyword: {}", keyword);
			List<MenuItemResponse> items = menuService.searchMenuItems(keyword);
			return ResponseEntity.ok(new ApiResponse(true, "Search completed successfully", items));
		} catch (Exception e) {
			log.error("Error searching menu items: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Search failed: " + e.getMessage(), null));
		}
	}

	@GetMapping("/items/{id}")
	public ResponseEntity<ApiResponse> getMenuItemById(@PathVariable Long id) {
		try {
			MenuItemResponse item = menuService.getMenuItemById(id);
			return ResponseEntity.ok(new ApiResponse(true, "Menu item fetched successfully", item));
		} catch (Exception e) {
			log.error("Error fetching menu item {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/vendor/{vendorId}")
	public ResponseEntity<ApiResponse> getMenuItemsByVendor(@PathVariable Long vendorId) {
		try {
			log.info("Fetching menu items for vendor: {}", vendorId);
			List<MenuItemResponse> items = menuService.getMenuItemsByVendor(vendorId);
			return ResponseEntity.ok(new ApiResponse(true, "Menu items fetched successfully", items));
		} catch (Exception e) {
			log.error("Error fetching menu items for vendor {}: {}", vendorId, e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PostMapping("/items")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> createMenuItem(@RequestBody MenuItemRequest request) {
		try {
			Long vendorId = getCurrentUserId();
			request.setVendorId(vendorId);

			log.info("Creating menu item for vendor: {}", vendorId);
			MenuItemResponse item = menuService.createMenuItem(request);

			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, "Menu item created successfully", item));
		} catch (Exception e) {
			log.error("Error creating menu item: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to create menu item: " + e.getMessage(), null));
		}
	}

	@PutMapping("/items/{id}")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> updateMenuItem(@PathVariable Long id, @RequestBody MenuItemRequest request) {
		try {
			Long vendorId = getCurrentUserId();
			request.setVendorId(vendorId);

			log.info("Updating menu item {} for vendor: {}", id, vendorId);
			MenuItemResponse item = menuService.updateMenuItem(id, request);

			return ResponseEntity.ok(new ApiResponse(true, "Menu item updated successfully", item));
		} catch (Exception e) {
			log.error("Error updating menu item {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@DeleteMapping("/items/{id}")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> deleteMenuItem(@PathVariable Long id) {
		try {
			log.info("Deleting menu item: {}", id);
			menuService.deleteMenuItem(id);
			return ResponseEntity.ok(new ApiResponse(true, "Menu item deleted successfully", null));
		} catch (Exception e) {
			log.error("Error deleting menu item {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/categories/vendor/{vendorId}")
	public ResponseEntity<ApiResponse> getCategoriesByVendor(
		@PathVariable Long vendorId,
		@RequestParam(defaultValue = "false") boolean includeItems
	) {
		try {
			log.info("Fetching categories for vendor: {}", vendorId);
			List<CategoryResponse> categories = menuService.getCategoriesByVendor(vendorId, includeItems);
			return ResponseEntity.ok(new ApiResponse(true, "Categories fetched successfully", categories));
		} catch (Exception e) {
			log.error("Error fetching categories for vendor {}: {}", vendorId, e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/categories/{id}")
	public ResponseEntity<ApiResponse> getCategoryById(
		@PathVariable Long id,
		@RequestParam(defaultValue = "false") boolean includeItems
	) {
		try {
			CategoryResponse category = menuService.getCategoryById(id, includeItems);
			return ResponseEntity.ok(new ApiResponse(true, "Category fetched successfully", category));
		} catch (Exception e) {
			log.error("Error fetching category {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PostMapping("/categories")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> createCategory(@RequestBody CategoryRequest request) {
		try {
			Long vendorId = getCurrentUserId();
			request.setVendorId(vendorId);

			log.info("Creating category for vendor: {}", vendorId);
			CategoryResponse category = menuService.createCategory(request);

			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, "Category created successfully", category));
		} catch (Exception e) {
			log.error("Error creating category: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to create category: " + e.getMessage(), null));
		}
	}

	@PutMapping("/categories/{id}")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
		try {
			Long vendorId = getCurrentUserId();
			request.setVendorId(vendorId);

			log.info("Updating category {} for vendor: {}", id, vendorId);
			CategoryResponse category = menuService.updateCategory(id, request);

			return ResponseEntity.ok(new ApiResponse(true, "Category updated successfully", category));
		} catch (Exception e) {
			log.error("Error updating category {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@DeleteMapping("/categories/{id}")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
		try {
			log.info("Deleting category: {}", id);
			menuService.deleteCategory(id);
			return ResponseEntity.ok(new ApiResponse(true, "Category deleted successfully", null));
		} catch (Exception e) {
			log.error("Error deleting category {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}
}
