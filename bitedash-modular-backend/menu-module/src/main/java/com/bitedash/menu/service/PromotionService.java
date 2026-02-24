package com.bitedash.menu.service;

import com.bitedash.menu.dto.mapper.PromotionMapper;
import com.bitedash.menu.dto.request.PromotionRequest;
import com.bitedash.menu.dto.response.PromotionResponse;
import com.bitedash.menu.entity.MenuItem;
import com.bitedash.menu.entity.Promotion;
import com.bitedash.menu.repository.MenuItemRepository;
import com.bitedash.menu.repository.PromotionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PromotionService {

	private static final Logger log = LoggerFactory.getLogger(PromotionService.class);

	@Autowired
	private PromotionRepository promotionRepository;

	@Autowired
	private MenuItemRepository menuItemRepository;

	@Transactional
	public PromotionResponse createPromotion(PromotionRequest request) {
		log.info("Creating promotion for menu item: {}", request.getMenuItemId());

		MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
			.orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + request.getMenuItemId()));

		if (!menuItem.getVendorId().equals(request.getVendorId())) {
			throw new RuntimeException("Unauthorized: Menu item does not belong to vendor");
		}

		Promotion promotion = PromotionMapper.toEntity(request);
		promotion.setMenuItem(menuItem);

		menuItem.setIsPromoted(true);
		menuItem.setPromotionType(request.getPromotionType());
		menuItem.setPromotionStartDate(request.getStartDate());
		menuItem.setPromotionEndDate(request.getEndDate());
		menuItemRepository.save(menuItem);

		promotion = promotionRepository.save(promotion);
		log.info("Promotion created successfully: {}", promotion.getId());

		return PromotionMapper.toResponse(promotion);
	}

	public PromotionResponse getPromotionById(Long id) {
		log.info("Fetching promotion: {}", id);
		Promotion promotion = promotionRepository.findWithAnalyticsById(id)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));
		return PromotionMapper.toResponse(promotion);
	}

	public List<PromotionResponse> getActivePromotions() {
		log.info("Fetching active promotions");
		List<Promotion> promotions = promotionRepository.findActivePromotions(LocalDateTime.now());
		return PromotionMapper.toResponseList(promotions);
	}

	public List<PromotionResponse> getActivePromotionsByVendor(Long vendorId) {
		log.info("Fetching active promotions for vendor: {}", vendorId);
		List<Promotion> promotions = promotionRepository.findActivePromotionsByVendorId(vendorId, LocalDateTime.now());
		return PromotionMapper.toResponseList(promotions);
	}

	public List<PromotionResponse> getPromotionsByVendor(Long vendorId) {
		log.info("Fetching all promotions for vendor: {}", vendorId);
		List<Promotion> promotions = promotionRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
		return PromotionMapper.toResponseList(promotions);
	}

	@Transactional
	public PromotionResponse trackImpression(Long promotionId) {
		log.info("Tracking impression for promotion: {}", promotionId);

		Promotion promotion = promotionRepository.findById(promotionId)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + promotionId));

		promotion.incrementImpressions();
		promotion = promotionRepository.save(promotion);

		log.debug("Impression tracked. Total impressions: {}", promotion.getImpressions());
		return PromotionMapper.toResponse(promotion);
	}

	@Transactional
	public PromotionResponse trackClick(Long promotionId) {
		log.info("Tracking click for promotion: {}", promotionId);

		Promotion promotion = promotionRepository.findById(promotionId)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + promotionId));

		promotion.incrementClicks();
		promotion = promotionRepository.save(promotion);

		log.debug("Click tracked. Total clicks: {}", promotion.getClicks());
		return PromotionMapper.toResponse(promotion);
	}

	@Transactional
	public void trackOrderGenerated(Long promotionId) {
		log.info("Tracking order generated for promotion: {}", promotionId);

		Promotion promotion = promotionRepository.findById(promotionId)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + promotionId));

		promotion.incrementOrdersGenerated();
		promotionRepository.save(promotion);

		log.debug("Order tracked. Total orders: {}", promotion.getOrdersGenerated());
	}

	public PromotionResponse getPromotionAnalytics(Long promotionId) {
		log.info("Fetching analytics for promotion: {}", promotionId);

		Promotion promotion = promotionRepository.findWithAnalyticsById(promotionId)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + promotionId));

		PromotionResponse response = PromotionMapper.toResponse(promotion);

		log.info("Analytics for promotion {}: CTR={}, Conversion={}, Cost per order={}",
			promotionId, response.getClickThroughRate(), response.getConversionRate(), response.getCostPerOrder());

		return response;
	}

	@Transactional
	public PromotionResponse updatePromotionStatus(Long promotionId, String status) {
		log.info("Updating promotion {} status to: {}", promotionId, status);

		Promotion promotion = promotionRepository.findById(promotionId)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + promotionId));

		promotion.setStatus(status);

		if ("PAUSED".equals(status) || "COMPLETED".equals(status)) {
			MenuItem menuItem = promotion.getMenuItem();
			if (menuItem != null) {
				menuItem.setIsPromoted(false);
				menuItemRepository.save(menuItem);
			}
		}

		promotion = promotionRepository.save(promotion);
		log.info("Promotion status updated successfully: {}", promotionId);

		return PromotionMapper.toResponse(promotion);
	}

	@Transactional
	public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
		log.info("Updating promotion: {}", id);

		Promotion promotion = promotionRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));

		if (!promotion.getVendorId().equals(request.getVendorId())) {
			throw new RuntimeException("Unauthorized: Promotion does not belong to vendor");
		}

		PromotionMapper.updateEntity(promotion, request);
		promotion = promotionRepository.save(promotion);

		log.info("Promotion updated successfully: {}", id);
		return PromotionMapper.toResponse(promotion);
	}

	@Transactional
	public void deletePromotion(Long id) {
		log.info("Deleting promotion: {}", id);

		Promotion promotion = promotionRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));

		MenuItem menuItem = promotion.getMenuItem();
		if (menuItem != null) {
			menuItem.setIsPromoted(false);
			menuItemRepository.save(menuItem);
		}

		promotion.setDeleted(true);
		promotionRepository.save(promotion);

		log.info("Promotion deleted successfully: {}", id);
	}

	@Transactional
	public void expirePromotions() {
		log.info("Running promotion expiration check");

		List<Promotion> expiredPromotions = promotionRepository.findExpiredActivePromotions(LocalDateTime.now());

		if (!expiredPromotions.isEmpty()) {
			log.info("Found {} expired promotions", expiredPromotions.size());

			for (Promotion promotion : expiredPromotions) {
				promotion.setStatus("COMPLETED");

				MenuItem menuItem = promotion.getMenuItem();
				if (menuItem != null) {
					menuItem.setIsPromoted(false);
					menuItemRepository.save(menuItem);
				}
			}

			promotionRepository.saveAll(expiredPromotions);
			log.info("Expired {} promotions", expiredPromotions.size());
		} else {
			log.info("No expired promotions found");
		}
	}
}
