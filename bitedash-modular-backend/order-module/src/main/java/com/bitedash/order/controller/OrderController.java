package com.bitedash.order.controller;

import com.bitedash.order.dto.request.OrderRequest;
import com.bitedash.order.dto.request.RateOrderRequest;
import com.bitedash.order.dto.response.OrderResponse;
import com.bitedash.order.dto.response.OrderStatusHistoryResponse;
import com.bitedash.order.service.OrderService;
import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

	private static final Logger log = LoggerFactory.getLogger(OrderController.class);

	@Autowired
	private OrderService orderService;

	/**
	 * Helper method to get current user ID from context
	 */
	private Long getCurrentUserId() {
		return UserContext.get().userId();
	}

	/**
	 * Helper method to get current user role from context
	 */
	private String getCurrentUserRole() {
		return UserContext.get().role();
	}

	/**
	 * Helper method to get current user's organization ID from context
	 */
	private Long getCurrentUserOrgId() {
		return UserContext.get().orgId();
	}

	/**
	 * Helper method to check if current user is admin
	 */
	private boolean isCurrentUserAdmin() {
		String role = getCurrentUserRole();
		return "ROLE_SUPER_ADMIN".equals(role) || "ROLE_ORG_ADMIN".equals(role);
	}

	@PostMapping
	public ResponseEntity<ApiResponse> createOrder(@RequestBody OrderRequest request) {
		try {
			log.info("Creating order for vendor: {}", request.getVendorId());

			Long userId = getCurrentUserId();
			Long organizationId = getCurrentUserOrgId();

			if (organizationId == null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ApiResponse(false, "Organization ID is required to create an order", null));
			}

			OrderResponse order = orderService.createOrder(request, userId, organizationId);

			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, "Order created successfully", order));

		} catch (Exception e) {
			log.error("Error creating order: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to create order: " + e.getMessage(), null));
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long id) {
		try {
			OrderResponse order = orderService.getOrderById(id);

			// Authorization check: User can only view their own orders or if they're admin/vendor
			Long currentUserId = getCurrentUserId();

			boolean isOwner = order.getUserId().equals(currentUserId);
			boolean isVendor = order.getVendorId().equals(currentUserId);
			boolean isAdmin = isCurrentUserAdmin();

			if (!isOwner && !isVendor && !isAdmin) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(new ApiResponse(false, "Access denied: You can only view your own orders", null));
			}

			return ResponseEntity.ok(new ApiResponse(true, "Order fetched successfully", order));

		} catch (Exception e) {
			log.error("Error fetching order {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/qr/{qrCodeData}")
	public ResponseEntity<ApiResponse> getOrderByQRCode(@PathVariable String qrCodeData) {
		try {
			log.info("Looking up order by QR code");
			OrderResponse order = orderService.getOrderByQRCode(qrCodeData);
			return ResponseEntity.ok(new ApiResponse(true, "Order found", order));

		} catch (Exception e) {
			log.error("Error fetching order by QR: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/{id}/history")
	public ResponseEntity<ApiResponse> getOrderHistory(@PathVariable Long id) {
		try {
			// First fetch the order to verify ownership
			OrderResponse order = orderService.getOrderById(id);

			// Authorization check: User can only view their own order history or if they're admin/vendor
			Long currentUserId = getCurrentUserId();

			boolean isOwner = order.getUserId().equals(currentUserId);
			boolean isVendor = order.getVendorId().equals(currentUserId);
			boolean isAdmin = isCurrentUserAdmin();

			if (!isOwner && !isVendor && !isAdmin) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(new ApiResponse(false, "Access denied: You can only view your own order history", null));
			}

			List<OrderStatusHistoryResponse> history = orderService.getOrderHistory(id);
			return ResponseEntity.ok(new ApiResponse(true, "Order history fetched successfully", history));

		} catch (Exception e) {
			log.error("Error fetching order history for {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PostMapping("/{id}/rate")
	public ResponseEntity<ApiResponse> rateOrder(@PathVariable Long id, @RequestBody RateOrderRequest request) {
		try {
			log.info("Rating order: {}", id);

			if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ApiResponse(false, "Rating must be between 1 and 5", null));
			}

			Long userId = getCurrentUserId();
			OrderResponse order = orderService.rateOrder(id, request, userId);

			return ResponseEntity.ok(new ApiResponse(true, "Order rated successfully", order));

		} catch (Exception e) {
			log.error("Error rating order {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}/status")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> updateOrderStatus(
		@PathVariable Long id,
		@RequestParam String status,
		@RequestParam(required = false) String remarks
	) {
		try {
			log.info("Updating order {} status to: {}", id, status);

			Long userId = getCurrentUserId();
			String role = getCurrentUserRole();

			OrderResponse order = orderService.updateOrderStatus(id, status, userId, role, remarks);

			return ResponseEntity.ok(new ApiResponse(true, "Order status updated successfully", order));

		} catch (Exception e) {
			log.error("Error updating order status for {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/my-orders")
	public ResponseEntity<ApiResponse> getMyOrders() {
		try {
			Long userId = getCurrentUserId();
			List<OrderResponse> orders = orderService.getUserOrders(userId);

			return ResponseEntity.ok(new ApiResponse(true, "Orders fetched successfully", orders));

		} catch (Exception e) {
			log.error("Error fetching user orders: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/vendor/{vendorId}")
	public ResponseEntity<ApiResponse> getVendorOrders(@PathVariable Long vendorId) {
		try {
			// Authorization check: Only the vendor themselves or admins can view vendor orders
			Long currentUserId = getCurrentUserId();
			String currentRole = getCurrentUserRole();

			boolean isVendor = currentUserId.equals(vendorId) && "ROLE_VENDOR".equals(currentRole);
			boolean isAdmin = isCurrentUserAdmin();

			if (!isVendor && !isAdmin) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(new ApiResponse(false, "Access denied: You can only view your own orders", null));
			}

			List<OrderResponse> orders = orderService.getVendorOrders(vendorId);

			return ResponseEntity.ok(new ApiResponse(true, "Vendor orders fetched successfully", orders));

		} catch (Exception e) {
			log.error("Error fetching vendor orders: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/vendor/{vendorId}/rating")
	public ResponseEntity<ApiResponse> getVendorRating(@PathVariable Long vendorId) {
		try {
			Double avgRating = orderService.getVendorAverageRating(vendorId);

			return ResponseEntity.ok(new ApiResponse(true, "Vendor rating fetched successfully", avgRating));

		} catch (Exception e) {
			log.error("Error fetching vendor rating: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}
}
