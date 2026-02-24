package com.bitedash.organisation.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bitedash.shared.api.identity.UserService;
import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.organisation.constant.OrganisationConstants.Message;
import com.bitedash.organisation.dto.request.OrgAndAdmCreate;
import com.bitedash.organisation.dto.request.OrganizationRequest;
import com.bitedash.organisation.dto.response.OrganizationResponse;
import com.bitedash.organisation.service.OrganizationService;

@RestController
@RequestMapping({"/organization", "/organisation"})  // Support both American and British spelling
public class OrganizationController {

	private static final Logger log = LoggerFactory.getLogger(OrganizationController.class);

	private final OrganizationService organizationService;
	private final UserService userService;

	public OrganizationController(OrganizationService organizationService, UserService userService) {
		this.organizationService = organizationService;
		this.userService = userService;
	}

	@PostMapping
	@RequireRole({Role.ROLE_SUPER_ADMIN})
	public ResponseEntity<ApiResponse> createOrg(@RequestBody OrgAndAdmCreate req) {

	    OrganizationResponse orgRes = organizationService.createOrganization(
	        new OrganizationRequest(req.name(), req.domain())
	    );

	    try {
	        // Register organization admin via identity module
	        Long adminUserId = userService.registerOrgAdmin(
	            req.fullName(),
	            req.email(),
	            req.password(),
	            req.phoneNumber(),
	            orgRes.getId(),
	            req.employeeId(),
	            req.officeId(),
	            req.shopName(),
	            req.gstNumber()
	        );

	        log.info("Organization {} and admin user {} created successfully", orgRes.getId(), adminUserId);

	        return ResponseEntity.status(HttpStatus.CREATED)
	                .body(new ApiResponse(true, "Organization and Admin created successfully", orgRes));

	    } catch (Exception e) {
	    	log.error("Admin creation failed for org {}. Rolling back...", orgRes.getId());
	        organizationService.deleteOrganization(orgRes.getId());

	        throw new RuntimeException("Failed to setup Admin: " + e.getMessage());
	    }
	}

	@GetMapping
	@RequireRole({Role.ROLE_SUPER_ADMIN})
	public ResponseEntity<ApiResponse> getAllOrgs() {
		return ResponseEntity.status(HttpStatus.OK)
				.body(new ApiResponse(true, Message.ORG_FETCHED.getMessage(), organizationService.findAllOrganisations()));
	}

	@GetMapping("/public")
	public ResponseEntity<ApiResponse> getAllOrgsPublic() {
		return ResponseEntity.status(HttpStatus.OK)
				.body(new ApiResponse(true, Message.ORG_FETCHED.getMessage(), organizationService.findAllOrganisations()));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse> getOrganizationById(@PathVariable Long id) {
		return ResponseEntity.status(HttpStatus.CREATED).body(
				new ApiResponse(true, Message.ORG_FETCHED.getMessage(), organizationService.findOrganizationById(id)));
	}

	@GetMapping("/super-admin/stats")
	@RequireRole({Role.ROLE_SUPER_ADMIN})
	public ResponseEntity<ApiResponse> getSuperAdminStats() {
		return ResponseEntity.status(HttpStatus.OK)
				.body(new ApiResponse(true, "Super Admin stats fetched successfully",
						organizationService.getSuperAdminStats()));
	}
}
