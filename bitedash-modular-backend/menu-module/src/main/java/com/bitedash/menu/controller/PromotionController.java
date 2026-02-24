package com.bitedash.menu.controller;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.enums.Role;
import com.bitedash.menu.dto.request.PromotionRequest;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.menu.dto.response.PromotionResponse;
import com.bitedash.menu.service.PromotionService;
import com.bitedash.shared.util.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/promotions")
public class PromotionController {

	private static final Logger log = LoggerFactory.getLogger(PromotionController.class);

	@Autowired
	private PromotionService promotionService;

	/**
	 * Helper method to get current user ID from context (typically vendorId for this controller)
	 */
	private Long getCurrentUserId() {
		return UserContext.get().userId();
	}

	@PostMapping
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> createPromotion(@RequestBody PromotionRequest request) {
		try {
			Long vendorId = getCurrentUserId();
			request.setVendorId(vendorId);

			log.info("Creating promotion for vendor: {}", vendorId);
			PromotionResponse promotion = promotionService.createPromotion(request);

			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, "Promotion created successfully", promotion));
		} catch (Exception e) {
			log.error("Error creating promotion: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, "Failed to create promotion: " + e.getMessage(), null));
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse> getPromotionById(@PathVariable Long id) {
		try {
			PromotionResponse promotion = promotionService.getPromotionById(id);
			return ResponseEntity.ok(new ApiResponse(true, "Promotion fetched successfully", promotion));
		} catch (Exception e) {
			log.error("Error fetching promotion {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/active")
	public ResponseEntity<ApiResponse> getActivePromotions() {
		try {
			log.info("Fetching active promotions");
			List<PromotionResponse> promotions = promotionService.getActivePromotions();
			return ResponseEntity.ok(new ApiResponse(true, "Active promotions fetched successfully", promotions));
		} catch (Exception e) {
			log.error("Error fetching active promotions: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/vendor/{vendorId}")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> getPromotionsByVendor(@PathVariable Long vendorId) {
		try {

			Long currentVendorId = getCurrentUserId();
			if (!currentVendorId.equals(vendorId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(new ApiResponse(false, "Unauthorized: Cannot access other vendor's promotions", null));
			}

			log.info("Fetching promotions for vendor: {}", vendorId);
			List<PromotionResponse> promotions = promotionService.getPromotionsByVendor(vendorId);
			return ResponseEntity.ok(new ApiResponse(true, "Promotions fetched successfully", promotions));
		} catch (Exception e) {
			log.error("Error fetching promotions for vendor {}: {}", vendorId, e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}/impression")
	public ResponseEntity<ApiResponse> trackImpression(@PathVariable Long id) {
		try {
			log.debug("Tracking impression for promotion: {}", id);
			PromotionResponse promotion = promotionService.trackImpression(id);
			return ResponseEntity.ok(new ApiResponse(true, "Impression tracked", promotion));
		} catch (Exception e) {
			log.error("Error tracking impression for promotion {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}/click")
	public ResponseEntity<ApiResponse> trackClick(@PathVariable Long id) {
		try {
			log.debug("Tracking click for promotion: {}", id);
			PromotionResponse promotion = promotionService.trackClick(id);
			return ResponseEntity.ok(new ApiResponse(true, "Click tracked", promotion));
		} catch (Exception e) {
			log.error("Error tracking click for promotion {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/{id}/analytics")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> getPromotionAnalytics(@PathVariable Long id) {
		try {
			log.info("Fetching analytics for promotion: {}", id);
			PromotionResponse analytics = promotionService.getPromotionAnalytics(id);
			return ResponseEntity.ok(new ApiResponse(true, "Analytics fetched successfully", analytics));
		} catch (Exception e) {
			log.error("Error fetching analytics for promotion {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}/status")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> updatePromotionStatus(
		@PathVariable Long id,
		@RequestParam String status
	) {
		try {
			log.info("Updating promotion {} status to: {}", id, status);

			if (!status.matches("ACTIVE|PAUSED|COMPLETED")) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ApiResponse(false, "Invalid status. Must be ACTIVE, PAUSED, or COMPLETED", null));
			}

			PromotionResponse promotion = promotionService.updatePromotionStatus(id, status);
			return ResponseEntity.ok(new ApiResponse(true, "Promotion status updated successfully", promotion));
		} catch (Exception e) {
			log.error("Error updating promotion status for {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PutMapping("/{id}")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> updatePromotion(@PathVariable Long id, @RequestBody PromotionRequest request) {
		try {
			Long vendorId = getCurrentUserId();
			request.setVendorId(vendorId);

			log.info("Updating promotion {} for vendor: {}", id, vendorId);
			PromotionResponse promotion = promotionService.updatePromotion(id, request);

			return ResponseEntity.ok(new ApiResponse(true, "Promotion updated successfully", promotion));
		} catch (Exception e) {
			log.error("Error updating promotion {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@DeleteMapping("/{id}")
	@RequireRole(Role.ROLE_VENDOR)
	public ResponseEntity<ApiResponse> deletePromotion(@PathVariable Long id) {
		try {
			log.info("Deleting promotion: {}", id);
			promotionService.deletePromotion(id);
			return ResponseEntity.ok(new ApiResponse(true, "Promotion deleted successfully", null));
		} catch (Exception e) {
			log.error("Error deleting promotion {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}
}
