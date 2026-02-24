package com.bitedash.inventory.controller;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.enums.Role;
import com.bitedash.inventory.dto.PurchaseOrderRequest;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.inventory.dto.PurchaseOrderResponse;
import com.bitedash.inventory.service.PurchaseOrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
public class PurchaseOrderController {

	private static final Logger log = LoggerFactory.getLogger(PurchaseOrderController.class);

	@Autowired
	private PurchaseOrderService purchaseOrderService;

	@PostMapping
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> createPurchaseOrder(@RequestBody PurchaseOrderRequest request) {
		try {
			log.info("Creating purchase order for cafeteria: {}", request.getCafeteriaId());
			PurchaseOrderResponse purchaseOrder = purchaseOrderService.createPurchaseOrder(request);
			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, "Purchase order created successfully", purchaseOrder));
		} catch (Exception e) {
			log.error("Error creating purchase order: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, "Failed to create purchase order: " + e.getMessage(), null));
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse> getPurchaseOrderById(@PathVariable Long id) {
		try {
			PurchaseOrderResponse purchaseOrder = purchaseOrderService.getPurchaseOrderById(id);
			return ResponseEntity.ok(new ApiResponse(true, "Purchase order fetched successfully", purchaseOrder));
		} catch (Exception e) {
			log.error("Error fetching purchase order: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/cafeteria/{cafeteriaId}")
	public ResponseEntity<ApiResponse> getPurchaseOrdersByCafeteria(@PathVariable Long cafeteriaId) {
		try {
			log.info("Fetching purchase orders for cafeteria: {}", cafeteriaId);
			List<PurchaseOrderResponse> purchaseOrders = purchaseOrderService.getPurchaseOrdersByCafeteria(cafeteriaId);
			return ResponseEntity.ok(new ApiResponse(true, "Purchase orders fetched successfully", purchaseOrders));
		} catch (Exception e) {
			log.error("Error fetching purchase orders: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse> getPurchaseOrdersByStatus(@PathVariable String status) {
		try {
			log.info("Fetching purchase orders with status: {}", status);
			List<PurchaseOrderResponse> purchaseOrders = purchaseOrderService.getPurchaseOrdersByStatus(status);
			return ResponseEntity.ok(new ApiResponse(true, "Purchase orders fetched successfully", purchaseOrders));
		} catch (Exception e) {
			log.error("Error fetching purchase orders: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}/approve")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> approvePurchaseOrder(@PathVariable Long id) {
		try {
			log.info("Approving purchase order: {}", id);
			PurchaseOrderResponse purchaseOrder = purchaseOrderService.approvePurchaseOrder(id);
			return ResponseEntity.ok(new ApiResponse(true, "Purchase order approved successfully", purchaseOrder));
		} catch (Exception e) {
			log.error("Error approving purchase order: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}/receive")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> receivePurchaseOrder(@PathVariable Long id) {
		try {
			log.info("Receiving purchase order: {}", id);
			PurchaseOrderResponse purchaseOrder = purchaseOrderService.receivePurchaseOrder(id);
			return ResponseEntity.ok(new ApiResponse(true, "Purchase order received successfully. Inventory updated.", purchaseOrder));
		} catch (Exception e) {
			log.error("Error receiving purchase order: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}/cancel")
	@RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> cancelPurchaseOrder(@PathVariable Long id) {
		try {
			log.info("Cancelling purchase order: {}", id);
			PurchaseOrderResponse purchaseOrder = purchaseOrderService.cancelPurchaseOrder(id);
			return ResponseEntity.ok(new ApiResponse(true, "Purchase order cancelled successfully", purchaseOrder));
		} catch (Exception e) {
			log.error("Error cancelling purchase order: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}
}
