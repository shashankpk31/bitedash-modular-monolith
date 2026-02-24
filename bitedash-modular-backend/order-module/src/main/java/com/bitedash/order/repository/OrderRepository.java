package com.bitedash.order.repository;

import com.bitedash.order.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Order> findWithItemsById(Long id);

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Order> findByOrderNumber(String orderNumber);

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Order> findByQrCodeData(String qrCodeData);

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	List<Order> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	List<Order> findByVendorIdAndDeletedFalseOrderByCreatedAtDesc(Long vendorId);

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	List<Order> findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(Long organizationId);

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	List<Order> findByStatusAndDeletedFalseOrderByCreatedAtDesc(String status);

	@EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
	List<Order> findByVendorIdAndStatusAndDeletedFalseOrderByCreatedAtDesc(Long vendorId, String status);

	long countByVendorIdAndDeletedFalse(Long vendorId);
	long countByUserIdAndDeletedFalse(Long userId);
	long countByOrganizationIdAndDeletedFalse(Long organizationId);
	long countByStatusAndDeletedFalse(String status);

	boolean existsByOrderNumber(String orderNumber);

	@Query("SELECT o FROM Order o WHERE o.rating IS NOT NULL AND o.deleted = false ORDER BY o.createdAt DESC")
	List<Order> findOrdersWithRatings();

	@Query("SELECT AVG(o.rating) FROM Order o WHERE o.vendorId = :vendorId AND o.rating IS NOT NULL AND o.deleted = false")
	Double findAverageRatingByVendorId(@Param("vendorId") Long vendorId);
}
