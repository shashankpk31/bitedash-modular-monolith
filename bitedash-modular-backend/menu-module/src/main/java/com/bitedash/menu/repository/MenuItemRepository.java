package com.bitedash.menu.repository;

import com.bitedash.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	Optional<MenuItem> findWithCategoryById(Long id);

	@EntityGraph(value = "MenuItem.withAddons", type = EntityGraph.EntityGraphType.LOAD)
	Optional<MenuItem> findWithAddonsById(Long id);

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByVendorIdAndDeletedFalseOrderByDisplayOrderAsc(Long vendorId);

	@EntityGraph(value = "MenuItem.withAddons", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByCategory_IdAndDeletedFalseOrderByDisplayOrderAsc(Long categoryId);

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByIsPromotedTrueAndDeletedFalseOrderByPromotionRankAsc();

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	@Query("SELECT m FROM MenuItem m WHERE m.isPromoted = true " +
		   "AND m.promotionStartDate <= :now AND m.promotionEndDate >= :now " +
		   "AND m.deleted = false " +
		   "ORDER BY m.promotionRank ASC")
	List<MenuItem> findActivePromotedItems(@Param("now") LocalDateTime now);

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByIsAvailableTrueAndDeletedFalseOrderByPopularityScoreDesc();

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByVendorIdAndIsAvailableTrueAndDeletedFalseOrderByPopularityScoreDesc(Long vendorId);

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByIsAvailableTrueAndDeletedFalse();

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByVendorIdAndIsAvailableTrueAndDeletedFalse(Long vendorId);

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByIsVegTrueAndIsAvailableTrueAndDeletedFalse();

	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	@Query("SELECT m FROM MenuItem m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND m.deleted = false")
	List<MenuItem> searchByName(@Param("keyword") String keyword);

	long countByVendorIdAndDeletedFalse(Long vendorId);
	long countByCategory_IdAndDeletedFalse(Long categoryId);
	long countByIsPromotedTrueAndDeletedFalse();
	long countByIsAvailableTrueAndDeletedFalse();

	// Public API methods
	boolean existsById(Long id);

	// Cross-module query - get menu items by multiple vendor IDs
	@EntityGraph(value = "MenuItem.withCategory", type = EntityGraph.EntityGraphType.LOAD)
	List<MenuItem> findByVendorIdInAndDeletedFalseOrderByVendorIdAscDisplayOrderAsc(List<Long> vendorIds);
}
