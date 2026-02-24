package com.bitedash.payment.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenueResponse {
	private LocalDate date;
	private BigDecimal totalRevenue;
	private Map<String, BigDecimal> revenueByType = new HashMap<>();

	public DailyRevenueResponse(LocalDate date, BigDecimal totalRevenue) {
		this.date = date;
		this.totalRevenue = totalRevenue;
	}

	public void addRevenueByType(String type, BigDecimal amount) {
		this.revenueByType.put(type, amount);
	}
}
