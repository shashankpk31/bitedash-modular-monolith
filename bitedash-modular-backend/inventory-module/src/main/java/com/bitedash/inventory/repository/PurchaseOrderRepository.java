package com.bitedash.inventory.repository;

import com.bitedash.inventory.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

	@EntityGraph(value = "PurchaseOrder.withItems", type = EntityGraph.EntityGraphType.LOAD)
	Optional<PurchaseOrder> findWithItemsById(Long id);

	Optional<PurchaseOrder> findByPoNumberAndDeletedFalse(String poNumber);

	List<PurchaseOrder> findByCafeteriaIdAndDeletedFalseOrderByOrderDateDesc(Long cafeteriaId);

	List<PurchaseOrder> findByStatusAndDeletedFalseOrderByOrderDateDesc(String status);

	List<PurchaseOrder> findByCafeteriaIdAndStatusAndDeletedFalseOrderByOrderDateDesc(Long cafeteriaId, String status);

	@Query("SELECT po FROM PurchaseOrder po WHERE po.status = 'ORDERED' " +
		   "AND po.expectedDeliveryDate < :today AND po.deleted = false " +
		   "ORDER BY po.expectedDeliveryDate ASC")
	List<PurchaseOrder> findOverduePurchaseOrders(@Param("today") LocalDate today);

	List<PurchaseOrder> findBySupplierNameAndDeletedFalseOrderByOrderDateDesc(String supplierName);

	List<PurchaseOrder> findByStatusAndDeletedFalseOrderByOrderDateAsc(String status);

	boolean existsByPoNumberAndDeletedFalse(String poNumber);

	long countByCafeteriaIdAndDeletedFalse(Long cafeteriaId);
	long countByStatusAndDeletedFalse(String status);
	long countByCafeteriaIdAndStatusAndDeletedFalse(Long cafeteriaId, String status);
}
