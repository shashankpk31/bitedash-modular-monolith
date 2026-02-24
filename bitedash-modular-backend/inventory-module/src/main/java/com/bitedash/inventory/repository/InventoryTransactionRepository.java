package com.bitedash.inventory.repository;

import com.bitedash.inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

	List<InventoryTransaction> findByInventory_IdAndDeletedFalseOrderByCreatedAtDesc(Long inventoryId);

	@Query("SELECT it FROM InventoryTransaction it WHERE it.inventory.id = :inventoryId " +
		   "AND it.createdAt BETWEEN :startDate AND :endDate AND it.deleted = false " +
		   "ORDER BY it.createdAt DESC")
	List<InventoryTransaction> findByInventoryIdAndDateRange(@Param("inventoryId") Long inventoryId,
															  @Param("startDate") LocalDateTime startDate,
															  @Param("endDate") LocalDateTime endDate);

	List<InventoryTransaction> findByTransactionTypeAndDeletedFalseOrderByCreatedAtDesc(String transactionType);

	@Query("SELECT it FROM InventoryTransaction it WHERE it.inventory.cafeteriaId = :cafeteriaId " +
		   "AND it.deleted = false ORDER BY it.createdAt DESC")
	List<InventoryTransaction> findByCafeteriaId(@Param("cafeteriaId") Long cafeteriaId);

	List<InventoryTransaction> findByReferenceIdAndReferenceTypeAndDeletedFalse(Long referenceId, String referenceType);


	@Query("SELECT SUM(it.totalCost) FROM InventoryTransaction it " +
		   "WHERE it.inventory.id = :inventoryId AND it.transactionType = :type AND it.deleted = false")
	Double getTotalCostByInventoryAndType(@Param("inventoryId") Long inventoryId,
										   @Param("type") String transactionType);
}
