package com.bitedash.payment.repository;

import com.bitedash.payment.entity.PlatformRevenueLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlatformRevenueLogRepository extends JpaRepository<PlatformRevenueLog, Long> {

	List<PlatformRevenueLog> findByRevenueTypeAndDeletedFalseOrderByCreatedAtDesc(String revenueType);

	List<PlatformRevenueLog> findByVendorIdAndDeletedFalseOrderByCreatedAtDesc(Long vendorId);

	List<PlatformRevenueLog> findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(Long organizationId);

	List<PlatformRevenueLog> findByOrderIdAndDeletedFalseOrderByCreatedAtDesc(Long orderId);

	@Query("SELECT r FROM PlatformRevenueLog r WHERE r.createdAt BETWEEN :startDate AND :endDate " +
		   "AND r.deleted = false " +
		   "ORDER BY r.createdAt DESC")
	List<PlatformRevenueLog> findByDateRange(@Param("startDate") LocalDateTime startDate,
											  @Param("endDate") LocalDateTime endDate);

	@Query("SELECT r FROM PlatformRevenueLog r WHERE r.revenueType = :type " +
		   "AND r.createdAt BETWEEN :startDate AND :endDate AND r.deleted = false ORDER BY r.createdAt DESC")
	List<PlatformRevenueLog> findByTypeAndDateRange(@Param("type") String revenueType,
													 @Param("startDate") LocalDateTime startDate,
													 @Param("endDate") LocalDateTime endDate);

	@Query("SELECT SUM(r.amount) FROM PlatformRevenueLog r WHERE r.revenueType = :type AND r.deleted = false")
	Double getTotalRevenueByType(@Param("type") String revenueType);

	@Query("SELECT SUM(r.amount) FROM PlatformRevenueLog r WHERE r.revenueType = :type " +
		   "AND r.createdAt BETWEEN :startDate AND :endDate AND r.deleted = false")
	Double getTotalRevenueByTypeAndDateRange(@Param("type") String revenueType,
											  @Param("startDate") LocalDateTime startDate,
											  @Param("endDate") LocalDateTime endDate);

	@Query("SELECT SUM(r.amount) FROM PlatformRevenueLog r WHERE r.deleted = false")
	Double getTotalRevenue();

	@Query("SELECT SUM(r.amount) FROM PlatformRevenueLog r " +
		   "WHERE r.createdAt BETWEEN :startDate AND :endDate AND r.deleted = false")
	Double getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
									   @Param("endDate") LocalDateTime endDate);

	@Query("SELECT SUM(r.amount) FROM PlatformRevenueLog r WHERE r.vendorId = :vendorId AND r.deleted = false")
	Double getTotalRevenueByVendor(@Param("vendorId") Long vendorId);

	@Query("SELECT SUM(r.amount) FROM PlatformRevenueLog r WHERE r.organizationId = :orgId AND r.deleted = false")
	Double getTotalRevenueByOrganization(@Param("orgId") Long organizationId);

	@Query("SELECT DATE(r.createdAt) as date, SUM(r.amount) as total " +
		   "FROM PlatformRevenueLog r " +
		   "WHERE r.createdAt BETWEEN :startDate AND :endDate AND r.deleted = false " +
		   "GROUP BY DATE(r.createdAt) ORDER BY DATE(r.createdAt) DESC")
	List<Object[]> getDailyRevenueSummary(@Param("startDate") LocalDateTime startDate,
										   @Param("endDate") LocalDateTime endDate);

	@Query("SELECT r.revenueType, SUM(r.amount) FROM PlatformRevenueLog r " +
		   "WHERE r.createdAt BETWEEN :startDate AND :endDate AND r.deleted = false " +
		   "GROUP BY r.revenueType")
	List<Object[]> getRevenueBreakdownByType(@Param("startDate") LocalDateTime startDate,
											  @Param("endDate") LocalDateTime endDate);
}
