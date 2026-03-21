package com.bitedash.organisation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;
import com.bitedash.organisation.constant.OrganisationConstants.Message;
import com.bitedash.organisation.dto.request.VendorRequest;
import com.bitedash.organisation.service.VendorService;

@RestController
@RequestMapping({"/organisation/vendors/stalls", "/organization/vendors/stalls"})  // Support both spellings
public class VendorController {

	private final VendorService vendorService;

	public VendorController(VendorService vendorService) {
		this.vendorService = vendorService;
	}

	@PostMapping
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> createVendorStall(@RequestBody VendorRequest vendor) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, Message.VEN_CREATED.getMessage(), vendorService.createVendor(vendor)));
	}

	@GetMapping("/cafeteria/{cafeteriaId}")
	public ResponseEntity<ApiResponse> getVendorsByCafeteria(@PathVariable Long cafeteriaId) {
		return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, Message.VEN_FETCHED.getMessage(),
				vendorService.getVendorsByCafeteria(cafeteriaId)));
	}

	@GetMapping("/my-vendor")
	@RequireRole({Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getMyVendor() {
		Long userId = UserContext.get().userId();
		return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, Message.VEN_FETCHED.getMessage(),
				vendorService.getVendorByOwnerUserId(userId)));
	}

	@GetMapping("/{vendorId}/stats")
	@RequireRole({Role.ROLE_VENDOR, Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> getVendorStats(@PathVariable Long vendorId) {
		return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Vendor stats fetched successfully",
				vendorService.getVendorStats(vendorId)));
	}

	@GetMapping("/my-stats")
	@RequireRole({Role.ROLE_VENDOR})
	public ResponseEntity<ApiResponse> getMyVendorStats() {
		Long userId = UserContext.get().userId();
		// First get vendor by user ID, then get stats
		var vendor = vendorService.getVendorByOwnerUserId(userId);
		return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Vendor stats fetched successfully",
				vendorService.getVendorStats(vendor.getId())));
	}
}
