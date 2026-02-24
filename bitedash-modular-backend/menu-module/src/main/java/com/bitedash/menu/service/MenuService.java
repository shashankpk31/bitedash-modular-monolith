package com.bitedash.menu.service;

import com.bitedash.menu.api.MenuPublicService;
import com.bitedash.menu.dto.mapper.CategoryMapper;
import com.bitedash.menu.dto.mapper.MenuItemMapper;
import com.bitedash.menu.dto.request.CategoryRequest;
import com.bitedash.menu.dto.request.MenuItemRequest;
import com.bitedash.menu.dto.response.CategoryResponse;
import com.bitedash.menu.dto.response.MenuItemResponse;
import com.bitedash.menu.entity.Category;
import com.bitedash.menu.entity.MenuItem;
import com.bitedash.menu.repository.CategoryRepository;
import com.bitedash.menu.repository.MenuItemRepository;
import com.bitedash.shared.api.organisation.OrganisationService;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MenuService implements MenuPublicService {

	private static final Logger log = LoggerFactory.getLogger(MenuService.class);

	@Autowired
	private MenuItemRepository menuItemRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private OrganisationService organisationService;

	public List<MenuItemResponse> getMenuItemsByVendor(Long vendorId) {
		log.info("Fetching menu items for vendor: {}", vendorId);
		List<MenuItem> menuItems = menuItemRepository.findByVendorIdAndDeletedFalseOrderByDisplayOrderAsc(vendorId);
		return MenuItemMapper.toResponseList(menuItems);
	}

	public MenuItemResponse getMenuItemById(Long id) {
		log.info("Fetching menu item: {}", id);
		MenuItem menuItem = menuItemRepository.findWithCategoryById(id)
			.orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + id));
		return MenuItemMapper.toResponse(menuItem);
	}

	public List<MenuItemResponse> getActivePromotedItems() {
		log.info("Fetching active promoted items");
		List<MenuItem> promotedItems = menuItemRepository.findActivePromotedItems(LocalDateTime.now());
		return MenuItemMapper.toResponseList(promotedItems);
	}

	public List<MenuItemResponse> getPopularItems() {
		log.info("Fetching popular items");
		List<MenuItem> popularItems = menuItemRepository
			.findByIsAvailableTrueAndDeletedFalseOrderByPopularityScoreDesc();
		return MenuItemMapper.toResponseList(popularItems);
	}

	public List<MenuItemResponse> getPopularItemsByVendor(Long vendorId) {
		log.info("Fetching popular items for vendor: {}", vendorId);
		List<MenuItem> popularItems = menuItemRepository
			.findByVendorIdAndIsAvailableTrueAndDeletedFalseOrderByPopularityScoreDesc(vendorId);
		return MenuItemMapper.toResponseList(popularItems);
	}

	public List<MenuItemResponse> searchMenuItems(String keyword) {
		log.info("Searching menu items with keyword: {}", keyword);
		List<MenuItem> menuItems = menuItemRepository.searchByName(keyword);
		return MenuItemMapper.toResponseList(menuItems);
	}

	@Transactional
	public MenuItemResponse createMenuItem(MenuItemRequest request) {
		log.info("Creating menu item: {}", request.getName());

		MenuItem menuItem = MenuItemMapper.toEntity(request);

		if (request.getCategoryId() != null) {
			if (!categoryRepository.existsById(request.getCategoryId())) {
				throw new RuntimeException("Category not found with ID: " + request.getCategoryId());
			}
			Category category = categoryRepository.getReferenceById(request.getCategoryId());
			category.addMenuItem(menuItem);
		}

		menuItem = menuItemRepository.save(menuItem);
		log.info("Menu item created successfully: {}", menuItem.getId());

		return MenuItemMapper.toResponse(menuItem);
	}

	@Transactional
	public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
		log.info("Updating menu item: {}", id);

		MenuItem menuItem = menuItemRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + id));

		// Validate vendor ownership (unless user is admin)
		validateVendorOwnership(menuItem.getVendorId(), "update this menu item");

		MenuItemMapper.updateEntity(menuItem, request);

		if (request.getCategoryId() != null && !request.getCategoryId().equals(menuItem.getCategory().getId())) {
			if (!categoryRepository.existsById(request.getCategoryId())) {
				throw new RuntimeException("Category not found with ID: " + request.getCategoryId());
			}
			Category newCategory = categoryRepository.getReferenceById(request.getCategoryId());
			newCategory.addMenuItem(menuItem);
		}

		menuItem = menuItemRepository.save(menuItem);
		log.info("Menu item updated successfully: {}", id);

		return MenuItemMapper.toResponse(menuItem);
	}

	@Transactional
	public void deleteMenuItem(Long id) {
		log.info("Deleting menu item: {}", id);

		MenuItem menuItem = menuItemRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + id));

		// Validate vendor ownership (unless user is admin)
		validateVendorOwnership(menuItem.getVendorId(), "delete this menu item");

		menuItem.setDeleted(true);
		menuItemRepository.save(menuItem);

		log.info("Menu item deleted successfully: {}", id);
	}

	public List<CategoryResponse> getCategoriesByVendor(Long vendorId, boolean includeMenuItems) {
		log.info("Fetching categories for vendor: {}", vendorId);
		List<Category> categories = categoryRepository.findByVendorIdOrderByDisplayOrderAsc(vendorId);
		return CategoryMapper.toResponseList(categories, includeMenuItems);
	}

	public CategoryResponse getCategoryById(Long id, boolean includeMenuItems) {
		log.info("Fetching category: {}", id);

		Category category;
		if (includeMenuItems) {
			category = categoryRepository.findWithMenuItemsById(id)
				.orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
		} else {
			category = categoryRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
		}

		return CategoryMapper.toResponse(category, includeMenuItems);
	}

	@Transactional
	public CategoryResponse createCategory(CategoryRequest request) {
		log.info("Creating category: {}", request.getName());

		Category category = CategoryMapper.toEntity(request);
		category = categoryRepository.save(category);

		log.info("Category created successfully: {}", category.getId());
		return CategoryMapper.toResponse(category);
	}

	@Transactional
	public CategoryResponse updateCategory(Long id, CategoryRequest request) {
		log.info("Updating category: {}", id);

		Category category = categoryRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

		// Validate vendor ownership (unless user is admin)
		validateVendorOwnership(category.getVendorId(), "update this category");

		CategoryMapper.updateEntity(category, request);
		category = categoryRepository.save(category);

		log.info("Category updated successfully: {}", id);
		return CategoryMapper.toResponse(category);
	}

	@Transactional
	public void deleteCategory(Long id) {
		log.info("Deleting category: {}", id);

		Category category = categoryRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

		// Validate vendor ownership (unless user is admin)
		validateVendorOwnership(category.getVendorId(), "delete this category");

		category.setDeleted(true);
		categoryRepository.save(category);

		log.info("Category deleted successfully: {}", id);
	}

	// Public API methods for cross-module communication

	@Override
	public boolean menuItemExists(Long menuItemId) {
		return menuItemRepository.existsById(menuItemId);
	}

	@Override
	public List<MenuItemResponse> getMenuItemsByCafeteria(Long cafeteriaId) {
		log.info("Fetching menu items for cafeteria: {}", cafeteriaId);

		// Step 1: Get all active vendor IDs for this cafeteria (via cross-module API)
		List<Long> vendorIds = organisationService.getActiveVendorIdsByCafeteria(cafeteriaId);

		if (vendorIds.isEmpty()) {
			log.info("No active vendors found for cafeteria: {}", cafeteriaId);
			return List.of();
		}

		log.debug("Found {} vendors for cafeteria {}: {}", vendorIds.size(), cafeteriaId, vendorIds);

		// Step 2: Get all menu items for these vendors in a single query (optimized)
		List<MenuItem> menuItems = menuItemRepository.findByVendorIdInAndDeletedFalseOrderByVendorIdAscDisplayOrderAsc(vendorIds);

		log.info("Found {} menu items for cafeteria: {}", menuItems.size(), cafeteriaId);
		return MenuItemMapper.toResponseList(menuItems);
	}

	// Private helper methods

	/**
	 * Validates that the current user is either the owner vendor or an admin
	 * @param resourceVendorId The vendor ID that owns the resource
	 * @param action Description of the action being performed (for error message)
	 * @throws RuntimeException if user doesn't have permission
	 */
	private void validateVendorOwnership(Long resourceVendorId, String action) {
		var userContext = UserContext.get();
		String userRole = userContext.role();

		// Admins can perform any action
		if ("ROLE_SUPER_ADMIN".equals(userRole) || "ROLE_ORG_ADMIN".equals(userRole)) {
			log.debug("Admin user {} performing action: {}", userContext.userId(), action);
			return;
		}

		// Vendors can only modify their own resources
		if ("ROLE_VENDOR".equals(userRole)) {
			// Check if user's vendor ID matches the resource's vendor ID
			// For vendors, userId is typically the ownerUserId of the vendor entity
			// We need to check if the current user is associated with this vendor
			if (!resourceVendorId.equals(userContext.userId())) {
				log.warn("Vendor {} attempted to {} belonging to vendor {}",
					userContext.userId(), action, resourceVendorId);
				throw new RuntimeException("You do not have permission to " + action);
			}
			log.debug("Vendor {} performing action on own resource: {}", userContext.userId(), action);
			return;
		}

		// Other roles cannot modify menu items/categories
		log.warn("User {} with role {} attempted to {} - not authorized",
			userContext.userId(), userContext.role(), action);
		throw new RuntimeException("You do not have permission to " + action);
	}
}
