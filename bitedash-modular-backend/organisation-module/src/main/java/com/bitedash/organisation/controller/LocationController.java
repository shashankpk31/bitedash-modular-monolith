package com.bitedash.organisation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;
import com.bitedash.organisation.constant.OrganisationConstants.Message;
import com.bitedash.organisation.dto.request.LocationRequest;
import com.bitedash.organisation.dto.request.OfficeRequest;
import com.bitedash.organisation.service.LocationService;

@RestController
@RequestMapping({"/organisation", "/organization"})  // Support both American and British spelling
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/locations")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> createLocation(@RequestBody LocationRequest location) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
				new ApiResponse(true, Message.LOC_CREATED.getMessage(), locationService.saveLocation(location)));
    }

    @GetMapping("/locations/org/{orgId}")
    public ResponseEntity<ApiResponse> getLocationsByOrg(@PathVariable Long orgId) {
        // Validate organization access (unless SUPER_ADMIN)
        var userContext = UserContext.get();
        if (!"ROLE_SUPER_ADMIN".equals(userContext.role())) {
            Long userOrgId = userContext.orgId();
            if (userOrgId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse(false, "Organization ID is required", null));
            }
            if (!orgId.equals(userOrgId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    new ApiResponse(false, "Access denied: You can only view locations from your own organization", null));
            }
        }

        return ResponseEntity.status(HttpStatus.OK).body(
				new ApiResponse(true, Message.LOC_FETCHED.getMessage(), locationService.findByOrgId(orgId)));
    }

    @PutMapping("/locations/{id}")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> updateLocation(
            @PathVariable Long id,
            @RequestBody LocationRequest locationRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse(true, Message.LOC_UPDATED.getMessage(),
                        locationService.updateLocation(id, locationRequest)));
    }

    @DeleteMapping("/locations/{id}")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse(true, Message.LOC_DELETED.getMessage(), null));
    }

    @PostMapping("/offices")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> createOffice(@RequestBody OfficeRequest office) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
				new ApiResponse(true, Message.OFF_CREATED.getMessage(), locationService.createOffice(office)));
    }

    @GetMapping("/offices/location/{locationId}")
    public ResponseEntity<ApiResponse> getOfficesByLocation(@PathVariable Long locationId) {
        return ResponseEntity.status(HttpStatus.OK).body(
				new ApiResponse(true, Message.OFF_FETCHED.getMessage(), locationService.getOfficesByLocation(locationId)));
    }

    @PutMapping("/offices/{id}")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> updateOffice(
            @PathVariable Long id,
            @RequestBody OfficeRequest officeRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse(true, Message.OFF_UPDATED.getMessage(),
                        locationService.updateOffice(id, officeRequest)));
    }

    @DeleteMapping("/offices/{id}")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> deleteOffice(@PathVariable Long id) {
        locationService.deleteOffice(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse(true, Message.OFF_DELETED.getMessage(), null));
    }

    @GetMapping("/admin/stats")
    @RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
    public ResponseEntity<ApiResponse> getDashboardStats() {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse(true, "Dashboard stats fetched successfully",
                        locationService.getDashboardStats()));
    }
}
