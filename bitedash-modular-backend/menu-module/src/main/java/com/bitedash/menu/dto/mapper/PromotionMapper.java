package com.bitedash.menu.dto.mapper;

import com.bitedash.menu.dto.request.PromotionRequest;
import com.bitedash.menu.dto.response.PromotionResponse;
import com.bitedash.menu.entity.Promotion;

import java.util.List;
import java.util.stream.Collectors;

public class PromotionMapper {

	public static PromotionResponse toResponse(Promotion promotion) {
		if (promotion == null) {
			return null;
		}

		PromotionResponse response = new PromotionResponse();
		response.setId(promotion.getId());
		response.setVendorId(promotion.getVendorId());

		if (promotion.getMenuItem() != null) {
			response.setMenuItemId(promotion.getMenuItem().getId());
			response.setMenuItemName(promotion.getMenuItem().getName());
		}

		response.setPromotionType(promotion.getPromotionType());
		response.setStartDate(promotion.getStartDate());
		response.setEndDate(promotion.getEndDate());
		response.setPricePaid(promotion.getPricePaid());
		response.setImpressions(promotion.getImpressions());
		response.setClicks(promotion.getClicks());
		response.setOrdersGenerated(promotion.getOrdersGenerated());
		response.setStatus(promotion.getStatus());
		response.setCreatedAt(promotion.getCreatedAt());
		response.setUpdatedAt(promotion.getUpdatedAt());

		response.setClickThroughRate(calculateClickThroughRate(promotion));
		response.setConversionRate(calculateConversionRate(promotion));
		response.setCostPerOrder(calculateCostPerOrder(promotion));

		return response;
	}

	public static Promotion toEntity(PromotionRequest request) {
		if (request == null) {
			return null;
		}

		Promotion promotion = new Promotion();
		promotion.setVendorId(request.getVendorId());

		promotion.setPromotionType(request.getPromotionType());
		promotion.setStartDate(request.getStartDate());
		promotion.setEndDate(request.getEndDate());
		promotion.setPricePaid(request.getPricePaid());
		promotion.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

		return promotion;
	}

	public static void updateEntity(Promotion promotion, PromotionRequest request) {
		if (promotion == null || request == null) {
			return;
		}

		if (request.getPromotionType() != null) {
			promotion.setPromotionType(request.getPromotionType());
		}
		if (request.getStartDate() != null) {
			promotion.setStartDate(request.getStartDate());
		}
		if (request.getEndDate() != null) {
			promotion.setEndDate(request.getEndDate());
		}
		if (request.getPricePaid() != null) {
			promotion.setPricePaid(request.getPricePaid());
		}
		if (request.getStatus() != null) {
			promotion.setStatus(request.getStatus());
		}
	}

	public static List<PromotionResponse> toResponseList(List<Promotion> promotions) {
		if (promotions == null) {
			return null;
		}

		return promotions.stream()
				.map(PromotionMapper::toResponse)
				.collect(Collectors.toList());
	}

	private static Double calculateClickThroughRate(Promotion promotion) {
		if (promotion.getImpressions() == null || promotion.getImpressions() == 0) {
			return 0.0;
		}

		double ctr = ((double) promotion.getClicks() / promotion.getImpressions()) * 100;
		return Math.round(ctr * 100.0) / 100.0;
	}

	private static Double calculateConversionRate(Promotion promotion) {
		if (promotion.getClicks() == null || promotion.getClicks() == 0) {
			return 0.0;
		}

		double conversionRate = ((double) promotion.getOrdersGenerated() / promotion.getClicks()) * 100;
		return Math.round(conversionRate * 100.0) / 100.0;
	}

	private static Double calculateCostPerOrder(Promotion promotion) {
		if (promotion.getOrdersGenerated() == null || promotion.getOrdersGenerated() == 0) {
			return 0.0;
		}

		double costPerOrder = promotion.getPricePaid().doubleValue() / promotion.getOrdersGenerated();
		return Math.round(costPerOrder * 100.0) / 100.0;
	}
}
