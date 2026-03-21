package com.bitedash.organisation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuperAdminStatsResponse {

	private Integer totalOrganizations;
	private Integer activeOrganizations;
	private Integer totalLocations;
	private Integer totalVendors;
	private Integer pendingVendors;
	private Integer totalUsers;

	// Constructor for backward compatibility
	public SuperAdminStatsResponse(Integer totalOrganizations, Integer totalLocations, Integer pendingVendors) {
		this.totalOrganizations = totalOrganizations;
		this.totalLocations = totalLocations;
		this.pendingVendors = pendingVendors;
		this.activeOrganizations = 0;
		this.totalVendors = 0;
		this.totalUsers = 0;
	}
}
