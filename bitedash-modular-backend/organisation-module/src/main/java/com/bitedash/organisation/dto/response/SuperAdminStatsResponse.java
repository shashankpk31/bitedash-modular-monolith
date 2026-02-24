package com.bitedash.organisation.dto.response;

public class SuperAdminStatsResponse {

	private Integer totalOrganizations;
	private Integer totalLocations;
	private Integer pendingVendors;

	public SuperAdminStatsResponse() {
		super();
	}

	public SuperAdminStatsResponse(Integer totalOrganizations, Integer totalLocations, Integer pendingVendors) {
		super();
		this.totalOrganizations = totalOrganizations;
		this.totalLocations = totalLocations;
		this.pendingVendors = pendingVendors;
	}

	public Integer getTotalOrganizations() {
		return totalOrganizations;
	}

	public void setTotalOrganizations(Integer totalOrganizations) {
		this.totalOrganizations = totalOrganizations;
	}

	public Integer getTotalLocations() {
		return totalLocations;
	}

	public void setTotalLocations(Integer totalLocations) {
		this.totalLocations = totalLocations;
	}

	public Integer getPendingVendors() {
		return pendingVendors;
	}

	public void setPendingVendors(Integer pendingVendors) {
		this.pendingVendors = pendingVendors;
	}
}
