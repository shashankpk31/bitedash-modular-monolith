package com.bitedash.menu.repository;

import com.bitedash.menu.entity.Promotion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

	@EntityGraph(value = "Promotion.withMenuItem", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Promotion> findWithMenuItemById(Long id);

	@EntityGraph(value = "Promotion.withAnalytics", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Promotion> findWithAnalyticsById(Long id);

	List<Promotion> findByStatusOrderByCreatedAtDesc(String status);

	@EntityGraph(value = "Promotion.withMenuItem", type = EntityGraph.EntityGraphType.LOAD)
	List<Promotion> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

	@EntityGraph(value = "Promotion.withMenuItem", type = EntityGraph.EntityGraphType.LOAD)
	List<Promotion> findByVendorIdAndStatusOrderByCreatedAtDesc(Long vendorId, String status);

	@EntityGraph(value = "Promotion.withMenuItem", type = EntityGraph.EntityGraphType.LOAD)
	@Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' " +
		   "AND p.startDate <= :now AND p.endDate >= :now " +
		   "ORDER BY p.startDate DESC")
	List<Promotion> findActivePromotions(@Param("now") LocalDateTime now);

	@EntityGraph(value = "Promotion.withMenuItem", type = EntityGraph.EntityGraphType.LOAD)
	@Query("SELECT p FROM Promotion p WHERE p.vendorId = :vendorId AND p.status = 'ACTIVE' " +
		   "AND p.startDate <= :now AND p.endDate >= :now " +
		   "ORDER BY p.startDate DESC")
	List<Promotion> findActivePromotionsByVendorId(@Param("vendorId") Long vendorId, @Param("now") LocalDateTime now);

	@EntityGraph(value = "Promotion.withAnalytics", type = EntityGraph.EntityGraphType.LOAD)
	List<Promotion> findByMenuItem_IdOrderByCreatedAtDesc(Long menuItemId);

	@Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' " +
		   "AND p.endDate < :now")
	List<Promotion> findExpiredActivePromotions(@Param("now") LocalDateTime now);

	long countByVendorId(Long vendorId);
	long countByStatus(String status);
	long countByVendorIdAndStatus(Long vendorId, String status);
}
