package com.bitedash.payment.service;

import com.bitedash.payment.dto.request.CommissionLogRequest;
import com.bitedash.payment.dto.response.DailyRevenueResponse;
import com.bitedash.payment.dto.response.PlatformRevenueStatsResponse;
import com.bitedash.payment.dto.response.PlatformWalletResponse;
import com.bitedash.payment.entity.PlatformRevenueLog;
import com.bitedash.payment.entity.PlatformWallet;
import com.bitedash.payment.repository.PlatformRevenueLogRepository;
import com.bitedash.payment.repository.PlatformWalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlatformRevenueService {

	private static final Logger log = LoggerFactory.getLogger(PlatformRevenueService.class);

	@Autowired
	private PlatformRevenueLogRepository revenueLogRepository;

	@Autowired
	private PlatformWalletRepository platformWalletRepository;

	@Transactional
	public void logCommission(CommissionLogRequest request) {
		log.info("Logging commission for order: {}, amount: {}", request.getOrderId(), request.getAmount());

		PlatformRevenueLog revenueLog = PlatformRevenueLog.commission(
			request.getOrderId(),
			request.getAmount(),
			request.getVendorId(),
			request.getOrganizationId()
		);
		revenueLogRepository.save(revenueLog);

		PlatformWallet wallet = platformWalletRepository.getOrCreatePlatformWallet();
		wallet.addCommission(request.getAmount());
		platformWalletRepository.save(wallet);

		log.info("Commission logged successfully. New platform balance: {}", wallet.getBalance());
	}

	@Transactional
	public void logGatewayMarkup(Long paymentId, BigDecimal amount, Long userId) {
		log.info("Logging gateway markup for payment: {}, amount: {}", paymentId, amount);

		PlatformRevenueLog revenueLog = PlatformRevenueLog.gatewayMarkup(paymentId, amount, userId);
		revenueLogRepository.save(revenueLog);

		PlatformWallet wallet = platformWalletRepository.getOrCreatePlatformWallet();
		wallet.addGatewayMarkup(amount);
		platformWalletRepository.save(wallet);

		log.info("Gateway markup logged successfully. New platform balance: {}", wallet.getBalance());
	}

	@Transactional
	public void logPromotionRevenue(Long vendorId, BigDecimal amount, String promoType) {
		log.info("Logging promotion revenue from vendor: {}, amount: {}", vendorId, amount);

		PlatformRevenueLog revenueLog = PlatformRevenueLog.promotionRevenue(vendorId, amount, promoType);
		revenueLogRepository.save(revenueLog);

		PlatformWallet wallet = platformWalletRepository.getOrCreatePlatformWallet();
		wallet.addRevenue(amount);
		platformWalletRepository.save(wallet);

		log.info("Promotion revenue logged successfully. New platform balance: {}", wallet.getBalance());
	}

	public PlatformRevenueStatsResponse getRevenueStats(LocalDateTime startDate, LocalDateTime endDate) {
		log.info("Fetching revenue stats from {} to {}", startDate, endDate);

		PlatformRevenueStatsResponse stats = new PlatformRevenueStatsResponse();
		stats.setPeriodStart(startDate);
		stats.setPeriodEnd(endDate);

		Double commissionRevenue = revenueLogRepository.getTotalRevenueByTypeAndDateRange(
			"COMMISSION", startDate, endDate
		);
		Double gatewayMarkupRevenue = revenueLogRepository.getTotalRevenueByTypeAndDateRange(
			"GATEWAY_MARKUP", startDate, endDate
		);
		Double promotionRevenue = revenueLogRepository.getTotalRevenueByTypeAndDateRange(
			"PROMOTION_REVENUE", startDate, endDate
		);
		Double subscriptionRevenue = revenueLogRepository.getTotalRevenueByTypeAndDateRange(
			"SUBSCRIPTION_FEE", startDate, endDate
		);

		stats.setCommissionRevenue(toBigDecimal(commissionRevenue));
		stats.setGatewayMarkupRevenue(toBigDecimal(gatewayMarkupRevenue));
		stats.setPromotionRevenue(toBigDecimal(promotionRevenue));
		stats.setSubscriptionRevenue(toBigDecimal(subscriptionRevenue));

		BigDecimal totalRevenue = stats.getCommissionRevenue()
			.add(stats.getGatewayMarkupRevenue())
			.add(stats.getPromotionRevenue())
			.add(stats.getSubscriptionRevenue());
		stats.setTotalRevenue(totalRevenue);

		List<PlatformRevenueLog> logs = revenueLogRepository.findByDateRange(startDate, endDate);
		stats.setTotalTransactions(logs.size());

		long uniqueOrders = logs.stream()
			.filter(log -> log.getOrderId() != null)
			.map(PlatformRevenueLog::getOrderId)
			.distinct()
			.count();
		stats.setTotalOrders((int) uniqueOrders);

		log.info("Revenue stats fetched: Total revenue = {}", totalRevenue);
		return stats;
	}

	public PlatformRevenueStatsResponse getOverallRevenueStats() {
		log.info("Fetching overall revenue stats");

		PlatformRevenueStatsResponse stats = new PlatformRevenueStatsResponse();

		Double commissionRevenue = revenueLogRepository.getTotalRevenueByType("COMMISSION");
		Double gatewayMarkupRevenue = revenueLogRepository.getTotalRevenueByType("GATEWAY_MARKUP");
		Double promotionRevenue = revenueLogRepository.getTotalRevenueByType("PROMOTION_REVENUE");
		Double subscriptionRevenue = revenueLogRepository.getTotalRevenueByType("SUBSCRIPTION_FEE");

		stats.setCommissionRevenue(toBigDecimal(commissionRevenue));
		stats.setGatewayMarkupRevenue(toBigDecimal(gatewayMarkupRevenue));
		stats.setPromotionRevenue(toBigDecimal(promotionRevenue));
		stats.setSubscriptionRevenue(toBigDecimal(subscriptionRevenue));

		BigDecimal totalRevenue = stats.getCommissionRevenue()
			.add(stats.getGatewayMarkupRevenue())
			.add(stats.getPromotionRevenue())
			.add(stats.getSubscriptionRevenue());
		stats.setTotalRevenue(totalRevenue);

		long totalTransactions = revenueLogRepository.count();
		stats.setTotalTransactions((int) totalTransactions);

		log.info("Overall revenue stats fetched: Total revenue = {}", totalRevenue);
		return stats;
	}

	public List<DailyRevenueResponse> getDailyRevenue(LocalDateTime startDate, LocalDateTime endDate) {
		log.info("Fetching daily revenue from {} to {}", startDate, endDate);

		List<Object[]> dailyTotals = revenueLogRepository.getDailyRevenueSummary(startDate, endDate);
		List<Object[]> typeBreakdown = revenueLogRepository.getRevenueBreakdownByType(startDate, endDate);

		Map<String, BigDecimal> totalsByType = new HashMap<>();
		for (Object[] row : typeBreakdown) {
			String type = (String) row[0];
			Double amount = (Double) row[1];
			totalsByType.put(type, toBigDecimal(amount));
		}

		List<DailyRevenueResponse> dailyRevenue = new ArrayList<>();
		for (Object[] row : dailyTotals) {
			LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
			Double total = (Double) row[1];

			DailyRevenueResponse dailyResponse = new DailyRevenueResponse(date, toBigDecimal(total));
			dailyResponse.setRevenueByType(totalsByType);
			dailyRevenue.add(dailyResponse);
		}

		log.info("Daily revenue fetched: {} days", dailyRevenue.size());
		return dailyRevenue;
	}

	public PlatformWalletResponse getPlatformWallet() {
		log.info("Fetching platform wallet");

		PlatformWallet wallet = platformWalletRepository.getOrCreatePlatformWallet();

		PlatformWalletResponse response = new PlatformWalletResponse();
		response.setId(wallet.getId());
		response.setBalance(wallet.getBalance());
		response.setTotalCommissionEarned(wallet.getTotalCommissionEarned());
		response.setTotalGatewayMarkupEarned(wallet.getTotalGatewayMarkupEarned());
		response.setTotalPromotionSpent(wallet.getTotalPromotionSpent());
		response.setUpdatedAt(wallet.getUpdatedAt());

		log.info("Platform wallet balance: {}", wallet.getBalance());
		return response;
	}

	public BigDecimal getRevenueByVendor(Long vendorId) {
		log.info("Fetching revenue for vendor: {}", vendorId);
		Double revenue = revenueLogRepository.getTotalRevenueByVendor(vendorId);
		return toBigDecimal(revenue);
	}

	public BigDecimal getRevenueByOrganization(Long organizationId) {
		log.info("Fetching revenue for organization: {}", organizationId);
		Double revenue = revenueLogRepository.getTotalRevenueByOrganization(organizationId);
		return toBigDecimal(revenue);
	}

	private BigDecimal toBigDecimal(Double value) {
		return value != null ? BigDecimal.valueOf(value) : BigDecimal.ZERO;
	}
}
