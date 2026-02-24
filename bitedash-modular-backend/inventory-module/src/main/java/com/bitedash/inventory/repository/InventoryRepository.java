package com.bitedash.inventory.repository;

import com.bitedash.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

	@EntityGraph(value = "Inventory.withTransactions", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Inventory> findWithTransactionsById(Long id);

	@EntityGraph(value = "Inventory.withAlerts", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Inventory> findWithAlertsById(Long id);

	List<Inventory> findByCafeteriaIdAndDeletedFalse(Long cafeteriaId);

	List<Inventory> findByVendorIdAndDeletedFalse(Long vendorId);

	List<Inventory> findByCafeteriaIdAndVendorIdAndDeletedFalse(Long cafeteriaId, Long vendorId);

	List<Inventory> findByStockStatusAndDeletedFalse(String stockStatus);

	@Query("SELECT i FROM Inventory i WHERE i.cafeteriaId = :cafeteriaId " +
		   "AND i.stockQuantity <= i.minStockLevel " +
		   "AND i.deleted = false " +
		   "ORDER BY i.stockQuantity ASC")
	List<Inventory> findLowStockItemsByCafeteria(@Param("cafeteriaId") Long cafeteriaId);

	@Query("SELECT i FROM Inventory i WHERE i.cafeteriaId = :cafeteriaId " +
		   "AND i.stockQuantity = 0 AND i.deleted = false")
	List<Inventory> findOutOfStockItemsByCafeteria(@Param("cafeteriaId") Long cafeteriaId);

	@Query("SELECT i FROM Inventory i WHERE i.expiryDate IS NOT NULL " +
		   "AND i.expiryDate BETWEEN :startDate AND :endDate " +
		   "AND i.deleted = false " +
		   "ORDER BY i.expiryDate ASC")
	List<Inventory> findItemsExpiringBetween(@Param("startDate") LocalDate startDate,
											  @Param("endDate") LocalDate endDate);

	@Query("SELECT i FROM Inventory i WHERE i.expiryDate IS NOT NULL " +
		   "AND i.expiryDate < :today AND i.deleted = false")
	List<Inventory> findExpiredItems(@Param("today") LocalDate today);

	List<Inventory> findByStorageLocationAndDeletedFalse(String storageLocation);

	@Query("SELECT i FROM Inventory i WHERE LOWER(i.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) AND i.deleted = false")
	List<Inventory> searchByItemName(@Param("keyword") String keyword);

	@Query("SELECT i FROM Inventory i WHERE i.stockQuantity <= i.minStockLevel " +
		   "AND i.stockQuantity > 0 " +
		   "AND i.deleted = false " +
		   "ORDER BY i.stockQuantity ASC")
	List<Inventory> findItemsNeedingReorder();

	@Query("SELECT i FROM Inventory i WHERE i.cafeteriaId = :cafeteriaId " +
		   "AND i.stockQuantity <= i.minStockLevel AND i.stockQuantity > 0 " +
		   "AND i.deleted = false " +
		   "ORDER BY i.stockQuantity ASC")
	List<Inventory> findItemsNeedingReorderByCafeteria(@Param("cafeteriaId") Long cafeteriaId);

	long countByCafeteriaIdAndDeletedFalse(Long cafeteriaId);
	long countByVendorIdAndDeletedFalse(Long vendorId);
	long countByStockStatusAndDeletedFalse(String stockStatus);

	@Query("SELECT COUNT(i) FROM Inventory i WHERE i.stockQuantity <= i.minStockLevel AND i.deleted = false")
	long countLowStockItems();

	@Query("SELECT COUNT(i) FROM Inventory i WHERE i.cafeteriaId = :cafeteriaId " +
		   "AND i.stockQuantity <= i.minStockLevel AND i.deleted = false")
	long countLowStockItemsByCafeteria(@Param("cafeteriaId") Long cafeteriaId);
}
