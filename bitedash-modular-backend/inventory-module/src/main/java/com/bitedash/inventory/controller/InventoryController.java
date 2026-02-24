package com.bitedash.inventory.controller;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.enums.Role;
import com.bitedash.inventory.dto.InventoryRequest;
import com.bitedash.inventory.dto.RestockRequest;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.inventory.dto.InventoryResponse;
import com.bitedash.inventory.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

	private static final Logger log = LoggerFactory.getLogger(InventoryController.class);

	@Autowired
	private InventoryService inventoryService;

	@PostMapping
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> createInventoryItem(@RequestBody InventoryRequest request) {
		try {
			log.info("Creating inventory item: {}", request.getItemName());
			InventoryResponse inventory = inventoryService.createInventoryItem(request);
			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, "Inventory item created successfully", inventory));
		} catch (Exception e) {
			log.error("Error creating inventory item: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, "Failed to create inventory item: " + e.getMessage(), null));
		}
	}

	@PutMapping("/{id}")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> updateInventoryItem(@PathVariable Long id, @RequestBody InventoryRequest request) {
		try {
			log.info("Updating inventory item: {}", id);
			InventoryResponse inventory = inventoryService.updateInventoryItem(id, request);
			return ResponseEntity.ok(new ApiResponse(true, "Inventory item updated successfully", inventory));
		} catch (Exception e) {
			log.error("Error updating inventory item: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/{id}")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getInventoryItemById(@PathVariable Long id) {
		try {
			InventoryResponse inventory = inventoryService.getInventoryItemById(id);
			return ResponseEntity.ok(new ApiResponse(true, "Inventory item fetched successfully", inventory));
		} catch (Exception e) {
			log.error("Error fetching inventory item: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/cafeteria/{cafeteriaId}")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getInventoryByCafeteria(@PathVariable Long cafeteriaId) {
		try {
			log.info("Fetching inventory for cafeteria: {}", cafeteriaId);
			List<InventoryResponse> inventoryList = inventoryService.getInventoryByCafeteria(cafeteriaId);
			return ResponseEntity.ok(new ApiResponse(true, "Inventory fetched successfully", inventoryList));
		} catch (Exception e) {
			log.error("Error fetching inventory: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/cafeteria/{cafeteriaId}/low-stock")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getLowStockItems(@PathVariable Long cafeteriaId) {
		try {
			log.info("Fetching low stock items for cafeteria: {}", cafeteriaId);
			List<InventoryResponse> lowStockItems = inventoryService.getLowStockItemsByCafeteria(cafeteriaId);
			return ResponseEntity.ok(new ApiResponse(true, "Low stock items fetched successfully", lowStockItems));
		} catch (Exception e) {
			log.error("Error fetching low stock items: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/cafeteria/{cafeteriaId}/out-of-stock")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getOutOfStockItems(@PathVariable Long cafeteriaId) {
		try {
			log.info("Fetching out of stock items for cafeteria: {}", cafeteriaId);
			List<InventoryResponse> outOfStockItems = inventoryService.getOutOfStockItemsByCafeteria(cafeteriaId);
			return ResponseEntity.ok(new ApiResponse(true, "Out of stock items fetched successfully", outOfStockItems));
		} catch (Exception e) {
			log.error("Error fetching out of stock items: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/expiring-soon")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getItemsExpiringSoon(@RequestParam(defaultValue = "7") int days) {
		try {
			log.info("Fetching items expiring within {} days", days);
			List<InventoryResponse> expiringItems = inventoryService.getItemsExpiringSoon(days);
			return ResponseEntity.ok(new ApiResponse(true, "Expiring items fetched successfully", expiringItems));
		} catch (Exception e) {
			log.error("Error fetching expiring items: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/expired")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getExpiredItems() {
		try {
			log.info("Fetching expired items");
			List<InventoryResponse> expiredItems = inventoryService.getExpiredItems();
			return ResponseEntity.ok(new ApiResponse(true, "Expired items fetched successfully", expiredItems));
		} catch (Exception e) {
			log.error("Error fetching expired items: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/cafeteria/{cafeteriaId}/needs-reorder")
	public ResponseEntity<ApiResponse> getItemsNeedingReorder(@PathVariable Long cafeteriaId) {
		try {
			log.info("Fetching items needing reorder for cafeteria: {}", cafeteriaId);
			List<InventoryResponse> needsReorder = inventoryService.getItemsNeedingReorderByCafeteria(cafeteriaId);
			return ResponseEntity.ok(new ApiResponse(true, "Items needing reorder fetched successfully", needsReorder));
		} catch (Exception e) {
			log.error("Error fetching items needing reorder: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/search")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> searchInventoryItems(@RequestParam String keyword) {
		try {
			log.info("Searching inventory items with keyword: {}", keyword);
			List<InventoryResponse> inventoryList = inventoryService.searchInventoryItems(keyword);
			return ResponseEntity.ok(new ApiResponse(true, "Search completed successfully", inventoryList));
		} catch (Exception e) {
			log.error("Error searching inventory: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PostMapping("/restock")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> restockInventory(@RequestBody RestockRequest request) {
		try {
			log.info("Restocking inventory: {}", request.getInventoryId());
			InventoryResponse inventory = inventoryService.restockInventory(request);
			return ResponseEntity.ok(new ApiResponse(true, "Inventory restocked successfully", inventory));
		} catch (Exception e) {
			log.error("Error restocking inventory: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@DeleteMapping("/{id}")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> deleteInventoryItem(@PathVariable Long id) {
		try {
			log.info("Deleting inventory item: {}", id);
			inventoryService.deleteInventoryItem(id);
			return ResponseEntity.ok(new ApiResponse(true, "Inventory item deleted successfully", null));
		} catch (Exception e) {
			log.error("Error deleting inventory item: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}
}
