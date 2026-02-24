package com.bitedash.inventory.service;

import com.bitedash.inventory.dto.InventoryRequest;
import com.bitedash.inventory.dto.RestockRequest;
import com.bitedash.inventory.dto.InventoryResponse;
import com.bitedash.inventory.entity.Inventory;
import com.bitedash.inventory.entity.InventoryTransaction;
import com.bitedash.inventory.repository.InventoryRepository;
import com.bitedash.inventory.repository.InventoryTransactionRepository;
import com.bitedash.shared.util.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

	private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

	@Autowired
	private InventoryRepository inventoryRepository;

	@Autowired
	private InventoryTransactionRepository transactionRepository;

	@Transactional
	public InventoryResponse createInventoryItem(InventoryRequest request) {
		log.info("Creating inventory item: {}", request.getItemName());

		Inventory inventory = new Inventory();
		mapRequestToEntity(request, inventory);
		inventory.updateStockStatus();

		inventory = inventoryRepository.save(inventory);
		log.info("Inventory item created successfully: {}", inventory.getId());

		return toResponse(inventory);
	}

	@Transactional
	public InventoryResponse updateInventoryItem(Long id, InventoryRequest request) {
		log.info("Updating inventory item: {}", id);

		Inventory inventory = inventoryRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + id));

		mapRequestToEntity(request, inventory);
		inventory.updateStockStatus();

		inventory = inventoryRepository.save(inventory);
		log.info("Inventory item updated successfully: {}", id);

		return toResponse(inventory);
	}

	public InventoryResponse getInventoryItemById(Long id) {
		log.info("Fetching inventory item: {}", id);
		Inventory inventory = inventoryRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + id));
		return toResponse(inventory);
	}

	public List<InventoryResponse> getInventoryByCafeteria(Long cafeteriaId) {
		log.info("Fetching inventory for cafeteria: {}", cafeteriaId);
		List<Inventory> inventoryList = inventoryRepository.findByCafeteriaIdAndDeletedFalse(cafeteriaId);
		return inventoryList.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public List<InventoryResponse> getLowStockItemsByCafeteria(Long cafeteriaId) {
		log.info("Fetching low stock items for cafeteria: {}", cafeteriaId);
		List<Inventory> lowStockItems = inventoryRepository.findLowStockItemsByCafeteria(cafeteriaId);
		return lowStockItems.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public List<InventoryResponse> getOutOfStockItemsByCafeteria(Long cafeteriaId) {
		log.info("Fetching out of stock items for cafeteria: {}", cafeteriaId);
		List<Inventory> outOfStockItems = inventoryRepository.findOutOfStockItemsByCafeteria(cafeteriaId);
		return outOfStockItems.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public List<InventoryResponse> getItemsExpiringSoon(int days) {
		log.info("Fetching items expiring within {} days", days);
		LocalDate today = LocalDate.now();
		LocalDate futureDate = today.plusDays(days);
		List<Inventory> expiringItems = inventoryRepository.findItemsExpiringBetween(today, futureDate);
		return expiringItems.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public List<InventoryResponse> getExpiredItems() {
		log.info("Fetching expired items");
		List<Inventory> expiredItems = inventoryRepository.findExpiredItems(LocalDate.now());
		return expiredItems.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public List<InventoryResponse> getItemsNeedingReorderByCafeteria(Long cafeteriaId) {
		log.info("Fetching items needing reorder for cafeteria: {}", cafeteriaId);
		List<Inventory> needingReorder = inventoryRepository.findItemsNeedingReorderByCafeteria(cafeteriaId);
		return needingReorder.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public List<InventoryResponse> searchInventoryItems(String keyword) {
		log.info("Searching inventory items with keyword: {}", keyword);
		List<Inventory> inventoryList = inventoryRepository.searchByItemName(keyword);
		return inventoryList.stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Transactional
	public InventoryResponse restockInventory(RestockRequest request) {
		log.info("Restocking inventory: {}", request.getInventoryId());

		Inventory inventory = inventoryRepository.findById(request.getInventoryId())
			.orElseThrow(() -> new RuntimeException("Inventory item not found"));

		if (request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
			throw new RuntimeException("Restock quantity must be positive");
		}

		BigDecimal balanceBefore = inventory.getStockQuantity();
		BigDecimal balanceAfter = balanceBefore.add(request.getQuantity());

		InventoryTransaction transaction = new InventoryTransaction(
			inventory,
			"RESTOCK",
			request.getQuantity(),
			inventory.getUnit()
		);
		transaction.setBalanceBefore(balanceBefore);
		transaction.setBalanceAfter(balanceAfter);
		transaction.setRemarks(request.getRemarks());
		transaction.setReferenceType("MANUAL_ADJUSTMENT");
		transaction.setCreatedBy(UserContext.get() != null ? UserContext.get().username() : null);

		inventory.addTransaction(transaction);

		inventory.setStockQuantity(balanceAfter);
		inventory.setLastRestockedAt(LocalDateTime.now());
		inventory.updateStockStatus();

		inventory = inventoryRepository.save(inventory);
		log.info("Inventory restocked successfully. New quantity: {}", balanceAfter);

		return toResponse(inventory);
	}

	@Transactional
	public void deleteInventoryItem(Long id) {
		log.info("Deleting inventory item: {}", id);

		Inventory inventory = inventoryRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + id));

		inventory.setDeleted(true);
		inventoryRepository.save(inventory);

		log.info("Inventory item deleted successfully: {}", id);
	}

	private void mapRequestToEntity(InventoryRequest request, Inventory inventory) {
		if (request.getItemName() != null) {
			inventory.setItemName(request.getItemName());
		}
		if (request.getCafeteriaId() != null) {
			inventory.setCafeteriaId(request.getCafeteriaId());
		}
		if (request.getVendorId() != null) {
			inventory.setVendorId(request.getVendorId());
		}
		if (request.getStockQuantity() != null) {
			inventory.setStockQuantity(request.getStockQuantity());
		}
		if (request.getUnit() != null) {
			inventory.setUnit(request.getUnit());
		}
		if (request.getMinStockLevel() != null) {
			inventory.setMinStockLevel(request.getMinStockLevel());
		}
		if (request.getMaxStockLevel() != null) {
			inventory.setMaxStockLevel(request.getMaxStockLevel());
		}
		if (request.getReorderQuantity() != null) {
			inventory.setReorderQuantity(request.getReorderQuantity());
		}
		if (request.getCostPerUnit() != null) {
			inventory.setCostPerUnit(request.getCostPerUnit());
		}
		if (request.getSupplierName() != null) {
			inventory.setSupplierName(request.getSupplierName());
		}
		if (request.getSupplierContact() != null) {
			inventory.setSupplierContact(request.getSupplierContact());
		}
		if (request.getExpiryDate() != null) {
			inventory.setExpiryDate(request.getExpiryDate());
		}
		if (request.getStorageLocation() != null) {
			inventory.setStorageLocation(request.getStorageLocation());
		}
	}

	private InventoryResponse toResponse(Inventory inventory) {
		InventoryResponse response = new InventoryResponse();
		response.setId(inventory.getId());
		response.setItemName(inventory.getItemName());
		response.setCafeteriaId(inventory.getCafeteriaId());
		response.setVendorId(inventory.getVendorId());
		response.setStockQuantity(inventory.getStockQuantity());
		response.setUnit(inventory.getUnit());
		response.setMinStockLevel(inventory.getMinStockLevel());
		response.setMaxStockLevel(inventory.getMaxStockLevel());
		response.setReorderQuantity(inventory.getReorderQuantity());
		response.setCostPerUnit(inventory.getCostPerUnit());
		response.setSupplierName(inventory.getSupplierName());
		response.setSupplierContact(inventory.getSupplierContact());
		response.setLastRestockedAt(inventory.getLastRestockedAt());
		response.setExpiryDate(inventory.getExpiryDate());
		response.setStorageLocation(inventory.getStorageLocation());
		response.setStockStatus(inventory.getStockStatus());
		response.setIsAvailable(inventory.getIsAvailable());
		response.setNeedsReorder(inventory.needsReorder());
		response.setIsExpired(inventory.isExpired());
		response.setIsExpiringSoon(inventory.isExpiringSoon(7));
		response.setCreatedAt(inventory.getCreatedAt());
		response.setUpdatedAt(inventory.getUpdatedAt());
		return response;
	}
}
