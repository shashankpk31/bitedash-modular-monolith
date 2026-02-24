package com.bitedash.inventory.repository;

import com.bitedash.inventory.entity.InventoryAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryAlertRepository extends JpaRepository<InventoryAlert, Long> {

	List<InventoryAlert> findByIsAcknowledgedFalseAndDeletedFalseOrderByCreatedAtDesc();

	List<InventoryAlert> findByIsAcknowledgedFalseAndSeverityAndDeletedFalseOrderByCreatedAtDesc(String severity);

	List<InventoryAlert> findByInventory_IdAndDeletedFalseOrderByCreatedAtDesc(Long inventoryId);

	List<InventoryAlert> findByAlertTypeAndDeletedFalseOrderByCreatedAtDesc(String alertType);

	@Query("SELECT ia FROM InventoryAlert ia WHERE ia.inventory.cafeteriaId = :cafeteriaId " +
		   "AND ia.isAcknowledged = false AND ia.severity = 'CRITICAL' AND ia.deleted = false " +
		   "ORDER BY ia.createdAt DESC")
	List<InventoryAlert> findCriticalAlertsByCafeteria(@Param("cafeteriaId") Long cafeteriaId);

	long countByIsAcknowledgedFalseAndDeletedFalse();

	@Query("SELECT COUNT(ia) FROM InventoryAlert ia WHERE ia.inventory.cafeteriaId = :cafeteriaId " +
		   "AND ia.isAcknowledged = false AND ia.deleted = false")
	long countUnacknowledgedAlertsByCafeteria(@Param("cafeteriaId") Long cafeteriaId);
}
