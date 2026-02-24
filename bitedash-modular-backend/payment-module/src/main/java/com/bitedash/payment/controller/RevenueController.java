package com.bitedash.payment.controller;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.payment.dto.request.CommissionLogRequest;
import com.bitedash.payment.dto.response.DailyRevenueResponse;
import com.bitedash.payment.dto.response.PlatformRevenueStatsResponse;
import com.bitedash.payment.dto.response.PlatformWalletResponse;
import com.bitedash.payment.service.PlatformRevenueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/revenue")  // Keep as /revenue - frontend uses this path
public class RevenueController {

	private static final Logger log = LoggerFactory.getLogger(RevenueController.class);

	@Autowired
	private PlatformRevenueService revenueService;

	@PostMapping("/log-commission")
	@RequireRole(Role.ROLE_SUPER_ADMIN)
	public ResponseEntity<ApiResponse> logCommission(@RequestBody CommissionLogRequest request) {
		try {
			log.info("Logging commission for order: {}", request.getOrderId());
			revenueService.logCommission(request);
			return ResponseEntity.ok(new ApiResponse(true, "Commission logged successfully", null));
		} catch (Exception e) {
			log.error("Error logging commission: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to log commission: " + e.getMessage(), null));
		}
	}

	@GetMapping("/platform/stats")
	@RequireRole(Role.ROLE_SUPER_ADMIN)
	public ResponseEntity<ApiResponse> getPlatformRevenueStats(
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
	) {
		try {
			log.info("Fetching platform revenue stats");

			PlatformRevenueStatsResponse stats;
			if (startDate != null && endDate != null) {
				stats = revenueService.getRevenueStats(startDate, endDate);
			} else {
				stats = revenueService.getOverallRevenueStats();
			}

			return ResponseEntity.ok(new ApiResponse(true, "Revenue stats fetched successfully", stats));
		} catch (Exception e) {
			log.error("Error fetching revenue stats: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to fetch revenue stats: " + e.getMessage(), null));
		}
	}

	@GetMapping("/platform/daily")
	@RequireRole(Role.ROLE_SUPER_ADMIN)
	public ResponseEntity<ApiResponse> getDailyRevenue(
		@RequestParam(required = false) Integer days,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
	) {
		try {
			LocalDateTime start;
			LocalDateTime end;

			// If days parameter is provided, calculate date range
			if (days != null && days > 0) {
				end = LocalDateTime.now();
				start = end.minusDays(days);
				log.info("Fetching daily revenue for last {} days", days);
			}
			// Otherwise use provided startDate and endDate
			else if (startDate != null && endDate != null) {
				start = startDate;
				end = endDate;
				log.info("Fetching daily revenue from {} to {}", startDate, endDate);
			}
			// Default to last 30 days if nothing provided
			else {
				end = LocalDateTime.now();
				start = end.minusDays(30);
				log.info("Fetching daily revenue for default last 30 days");
			}

			List<DailyRevenueResponse> dailyRevenue = revenueService.getDailyRevenue(start, end);
			return ResponseEntity.ok(new ApiResponse(true, "Daily revenue fetched successfully", dailyRevenue));
		} catch (Exception e) {
			log.error("Error fetching daily revenue: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to fetch daily revenue: " + e.getMessage(), null));
		}
	}

	@GetMapping("/platform/wallet")
	@RequireRole(Role.ROLE_SUPER_ADMIN)
	public ResponseEntity<ApiResponse> getPlatformWallet() {
		try {
			log.info("Fetching platform wallet");
			PlatformWalletResponse wallet = revenueService.getPlatformWallet();
			return ResponseEntity.ok(new ApiResponse(true, "Platform wallet fetched successfully", wallet));
		} catch (Exception e) {
			log.error("Error fetching platform wallet: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to fetch platform wallet: " + e.getMessage(), null));
		}
	}

	@GetMapping("/vendor/{vendorId}")
	@RequireRole(Role.ROLE_SUPER_ADMIN)
	public ResponseEntity<ApiResponse> getRevenueByVendor(@PathVariable Long vendorId) {
		try {
			log.info("Fetching revenue for vendor: {}", vendorId);
			BigDecimal revenue = revenueService.getRevenueByVendor(vendorId);
			return ResponseEntity.ok(new ApiResponse(true, "Vendor revenue fetched successfully", revenue));
		} catch (Exception e) {
			log.error("Error fetching vendor revenue: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to fetch vendor revenue: " + e.getMessage(), null));
		}
	}

	@GetMapping("/organization/{orgId}")
	@RequireRole(Role.ROLE_SUPER_ADMIN)
	public ResponseEntity<ApiResponse> getRevenueByOrganization(@PathVariable Long orgId) {
		try {
			log.info("Fetching revenue for organization: {}", orgId);
			BigDecimal revenue = revenueService.getRevenueByOrganization(orgId);
			return ResponseEntity.ok(new ApiResponse(true, "Organization revenue fetched successfully", revenue));
		} catch (Exception e) {
			log.error("Error fetching organization revenue: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Failed to fetch organization revenue: " + e.getMessage(), null));
		}
	}
}
