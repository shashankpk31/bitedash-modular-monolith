package com.bitedash.organisation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrgAdminStatsResponse {

	private Integer totalEmployees;
	private Integer activeVendors;
	private Double monthlySpend;
	private Integer totalLocations;
	private Integer totalOrders;
	private Integer pendingApprovals;

	public OrgAdminStatsResponse(Integer totalEmployees, Integer activeVendors, Integer totalLocations) {
		this.totalEmployees = totalEmployees;
		this.activeVendors = activeVendors;
		this.totalLocations = totalLocations;
		this.monthlySpend = 0.0;
		this.totalOrders = 0;
		this.pendingApprovals = 0;
	}
}
