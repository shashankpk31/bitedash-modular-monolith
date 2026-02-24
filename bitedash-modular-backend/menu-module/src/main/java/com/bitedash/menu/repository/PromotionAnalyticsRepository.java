package com.bitedash.menu.repository;

import com.bitedash.menu.entity.PromotionAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionAnalyticsRepository extends JpaRepository<PromotionAnalytics, Long> {

	List<PromotionAnalytics> findByPromotion_IdOrderByDateDesc(Long promotionId);

	List<PromotionAnalytics> findByPromotion_IdAndDateBetweenOrderByDateDesc(
		Long promotionId, LocalDate startDate, LocalDate endDate);

	Optional<PromotionAnalytics> findByPromotion_IdAndDate(Long promotionId, LocalDate date);

	@Query("SELECT SUM(pa.revenueGenerated) FROM PromotionAnalytics pa " +
		   "WHERE pa.promotion.id = :promotionId")
	Double getTotalRevenueByPromotionId(@Param("promotionId") Long promotionId);

	@Query("SELECT SUM(pa.impressions) FROM PromotionAnalytics pa " +
		   "WHERE pa.promotion.id = :promotionId")
	Integer getTotalImpressionsByPromotionId(@Param("promotionId") Long promotionId);

	@Query("SELECT SUM(pa.clicks) FROM PromotionAnalytics pa " +
		   "WHERE pa.promotion.id = :promotionId")
	Integer getTotalClicksByPromotionId(@Param("promotionId") Long promotionId);

	@Query("SELECT SUM(pa.orders) FROM PromotionAnalytics pa " +
		   "WHERE pa.promotion.id = :promotionId")
	Integer getTotalOrdersByPromotionId(@Param("promotionId") Long promotionId);

	@Query("SELECT pa FROM PromotionAnalytics pa " +
		   "WHERE pa.date BETWEEN :startDate AND :endDate " +
		   "ORDER BY pa.revenueGenerated DESC")
	List<PromotionAnalytics> findTopPerformingPromotionsByDateRange(
		@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
