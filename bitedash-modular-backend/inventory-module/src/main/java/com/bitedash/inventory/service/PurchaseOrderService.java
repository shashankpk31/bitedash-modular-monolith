package com.bitedash.inventory.service;

import com.bitedash.inventory.dto.PurchaseOrderItemRequest;
import com.bitedash.inventory.dto.PurchaseOrderRequest;
import com.bitedash.inventory.dto.PurchaseOrderItemResponse;
import com.bitedash.inventory.dto.PurchaseOrderResponse;
import com.bitedash.inventory.entity.*;
import com.bitedash.inventory.repository.InventoryRepository;
import com.bitedash.inventory.repository.InventoryTransactionRepository;
import com.bitedash.inventory.repository.PurchaseOrderRepository;
import com.bitedash.shared.util.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
public class PurchaseOrderService {

	private static final Logger log = LoggerFactory.getLogger(PurchaseOrderService.class);

	@Autowired
	private PurchaseOrderRepository purchaseOrderRepository;

	@Autowired
	private InventoryRepository inventoryRepository;

	@Autowired
	private InventoryTransactionRepository transactionRepository;

	@Transactional
	public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
		log.info("Creating purchase order for cafeteria: {}", request.getCafeteriaId());

		PurchaseOrder purchaseOrder = new PurchaseOrder();
		purchaseOrder.setPoNumber(generatePONumber());
		purchaseOrder.setCafeteriaId(request.getCafeteriaId());
		purchaseOrder.setSupplierName(request.getSupplierName());
		purchaseOrder.setSupplierContact(request.getSupplierContact());
		purchaseOrder.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
		purchaseOrder.setRemarks(request.getRemarks());
		purchaseOrder.setCreatedBy(UserContext.get() != null ? UserContext.get().username() : null);
		purchaseOrder.setStatus("PENDING");

		for (PurchaseOrderItemRequest itemRequest : request.getItems()) {
			Inventory inventory = inventoryRepository.findById(itemRequest.getInventoryId())
				.orElseThrow(() -> new RuntimeException("Inventory not found: " + itemRequest.getInventoryId()));

			PurchaseOrderItem item = new PurchaseOrderItem(
				purchaseOrder,
				inventory,
				itemRequest.getItemName(),
				itemRequest.getQuantity(),
				itemRequest.getUnit(),
				itemRequest.getUnitCost()
			);
			purchaseOrder.addItem(item);
		}

		purchaseOrder = purchaseOrderRepository.save(purchaseOrder);
		log.info("Purchase order created successfully: {}", purchaseOrder.getPoNumber());

		return toResponse(purchaseOrder);
	}

	public PurchaseOrderResponse getPurchaseOrderById(Long id) {
		log.info("Fetching purchase order: {}", id);
		PurchaseOrder purchaseOrder = purchaseOrderRepository.findWithItemsById(id)
			.orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));
		return toResponse(purchaseOrder);
	}

	public List<PurchaseOrderResponse> getPurchaseOrdersByCafeteria(Long cafeteriaId) {
		log.info("Fetching purchase orders for cafeteria: {}", cafeteriaId);
		List<PurchaseOrder> purchaseOrders = purchaseOrderRepository
			.findByCafeteriaIdAndDeletedFalseOrderByOrderDateDesc(cafeteriaId);
		return purchaseOrders.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public List<PurchaseOrderResponse> getPurchaseOrdersByStatus(String status) {
		log.info("Fetching purchase orders with status: {}", status);
		List<PurchaseOrder> purchaseOrders = purchaseOrderRepository
			.findByStatusAndDeletedFalseOrderByOrderDateDesc(status);
		return purchaseOrders.stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Transactional
	public PurchaseOrderResponse approvePurchaseOrder(Long id) {
		log.info("Approving purchase order: {}", id);

		PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));

		if (!"PENDING".equals(purchaseOrder.getStatus())) {
			throw new RuntimeException("Only pending purchase orders can be approved");
		}

		Long userId = UserContext.get() != null ? UserContext.get().userId() : null;
		purchaseOrder.approve(userId);
		purchaseOrder.setStatus("ORDERED");

		purchaseOrder = purchaseOrderRepository.save(purchaseOrder);
		log.info("Purchase order approved successfully: {}", id);

		return toResponse(purchaseOrder);
	}

	@Transactional
	public PurchaseOrderResponse receivePurchaseOrder(Long id) {
		log.info("Receiving purchase order: {}", id);

		PurchaseOrder purchaseOrder = purchaseOrderRepository.findWithItemsById(id)
			.orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));

		if (!"ORDERED".equals(purchaseOrder.getStatus())) {
			throw new RuntimeException("Only ordered purchase orders can be received");
		}

		String username = UserContext.get() != null ? UserContext.get().username() : null;

		for (PurchaseOrderItem item : purchaseOrder.getItems()) {
			Inventory inventory = item.getInventory();

			BigDecimal balanceBefore = inventory.getStockQuantity();
			BigDecimal balanceAfter = balanceBefore.add(item.getQuantity());

			InventoryTransaction transaction = new InventoryTransaction(
				inventory,
				"RESTOCK",
				item.getQuantity(),
				item.getUnit()
			);
			transaction.setBalanceBefore(balanceBefore);
			transaction.setBalanceAfter(balanceAfter);
			transaction.setCostPerUnit(item.getCostPerUnit());
			transaction.setTotalCost(item.getTotalCost());
			transaction.setReferenceType("PURCHASE_ORDER");
			transaction.setReferenceId(purchaseOrder.getId());
			transaction.setRemarks("PO: " + purchaseOrder.getPoNumber());
			transaction.setCreatedBy(username);

			inventory.addTransaction(transaction);

			inventory.setStockQuantity(balanceAfter);
			inventory.setLastRestockedAt(LocalDateTime.now());
			inventory.updateStockStatus();

			inventoryRepository.save(inventory);

			item.receiveQuantity(item.getQuantity());
		}

		purchaseOrder.markAsReceived();
		purchaseOrder = purchaseOrderRepository.save(purchaseOrder);

		log.info("Purchase order received successfully: {}", id);

		return toResponse(purchaseOrder);
	}

	@Transactional
	public PurchaseOrderResponse cancelPurchaseOrder(Long id) {
		log.info("Cancelling purchase order: {}", id);

		PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));

		if ("RECEIVED".equals(purchaseOrder.getStatus())) {
			throw new RuntimeException("Cannot cancel a received purchase order");
		}

		purchaseOrder.cancel();
		purchaseOrder = purchaseOrderRepository.save(purchaseOrder);

		log.info("Purchase order cancelled successfully: {}", id);

		return toResponse(purchaseOrder);
	}

	private String generatePONumber() {
		LocalDate today = LocalDate.now();
		String datePart = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String randomPart = String.format("%04d", new Random().nextInt(10000));
		String poNumber = "PO-" + datePart + "-" + randomPart;

		int retries = 0;
		while (purchaseOrderRepository.existsByPoNumberAndDeletedFalse(poNumber) && retries < 5) {
			randomPart = String.format("%04d", new Random().nextInt(10000));
			poNumber = "PO-" + datePart + "-" + randomPart;
			retries++;
		}

		return poNumber;
	}

	private PurchaseOrderResponse toResponse(PurchaseOrder purchaseOrder) {
		PurchaseOrderResponse response = new PurchaseOrderResponse();
		response.setId(purchaseOrder.getId());
		response.setPoNumber(purchaseOrder.getPoNumber());
		response.setCafeteriaId(purchaseOrder.getCafeteriaId());
		response.setSupplierName(purchaseOrder.getSupplierName());
		response.setSupplierContact(purchaseOrder.getSupplierContact());
		response.setOrderDate(purchaseOrder.getOrderDate());
		response.setExpectedDeliveryDate(purchaseOrder.getExpectedDeliveryDate());
		response.setActualDeliveryDate(purchaseOrder.getActualDeliveryDate());
		response.setTotalAmount(purchaseOrder.getTotalAmount());
		response.setStatus(purchaseOrder.getStatus());
		response.setApprovedBy(purchaseOrder.getApprovedBy());
		response.setApprovedAt(purchaseOrder.getApprovedAt());
		response.setCreatedBy(purchaseOrder.getCreatedBy());
		response.setRemarks(purchaseOrder.getRemarks());
		response.setCreatedAt(purchaseOrder.getCreatedAt());
		response.setUpdatedAt(purchaseOrder.getUpdatedAt());

		if (purchaseOrder.getItems() != null) {
			List<PurchaseOrderItemResponse> items = purchaseOrder.getItems().stream()
				.map(this::toItemResponse)
				.collect(Collectors.toList());
			response.setItems(items);
		}

		return response;
	}

	private PurchaseOrderItemResponse toItemResponse(PurchaseOrderItem item) {
		PurchaseOrderItemResponse response = new PurchaseOrderItemResponse();
		response.setId(item.getId());
		response.setInventoryId(item.getInventory().getId());
		response.setItemName(item.getItemName());
		response.setQuantity(item.getQuantity());
		response.setUnit(item.getUnit());
		response.setUnitCost(item.getCostPerUnit());
		response.setTotalCost(item.getTotalCost());
		return response;
	}
}
