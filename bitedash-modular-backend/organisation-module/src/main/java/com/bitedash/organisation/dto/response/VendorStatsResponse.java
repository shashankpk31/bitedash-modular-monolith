package com.bitedash.organisation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorStatsResponse {

	private Integer totalOrders;
	private Integer activeOrders;
	private Integer completedToday;
	private Double totalRevenue;
	private Double avgOrderValue;
	private Double rating;
	private Integer totalMenuItems;
	private Integer activeMenuItems;
}
