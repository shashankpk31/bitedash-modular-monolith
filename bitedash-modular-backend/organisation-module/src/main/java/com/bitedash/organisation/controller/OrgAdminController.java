package com.bitedash.organisation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;
import com.bitedash.organisation.constant.OrganisationConstants.Message;
import com.bitedash.organisation.service.LocationService;

/**
 * Controller for Organization Admin specific endpoints.
 * These endpoints are designed for ORG_ADMIN users to manage their own organization.
 */
@RestController
@RequestMapping("/org-admin")
public class OrgAdminController {

    private final LocationService locationService;

    public OrgAdminController(LocationService locationService) {
        this.locationService = locationService;
    }

    /**
     * Get locations for the authenticated organization admin's organization.
     * This endpoint automatically uses the orgId from the user's context.
     */
    @GetMapping("/locations")
    @RequireRole({Role.ROLE_ORG_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<ApiResponse> getMyOrgLocations() {
        var userContext = UserContext.get();
        Long orgId = userContext.orgId();

        // SUPER_ADMIN can see all locations if they don't have an orgId
        if (orgId == null) {
            if ("ROLE_SUPER_ADMIN".equals(userContext.role())) {
                // Return all locations for super admin
                return ResponseEntity.status(HttpStatus.OK).body(
                    new ApiResponse(true, "All locations fetched successfully",
                        locationService.findAllLocations()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse(false, "Organization ID is required for org admin users", null));
            }
        }

        return ResponseEntity.status(HttpStatus.OK).body(
            new ApiResponse(true, Message.LOC_FETCHED.getMessage(),
                locationService.findByOrgId(orgId)));
    }
}
