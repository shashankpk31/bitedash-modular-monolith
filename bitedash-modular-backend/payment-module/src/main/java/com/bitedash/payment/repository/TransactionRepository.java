package com.bitedash.payment.repository;

import com.bitedash.payment.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

	Optional<Transaction> findByOrderIdAndDeletedFalse(Long orderId);

	List<Transaction> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

	List<Transaction> findByStatusAndDeletedFalseOrderByCreatedAtDesc(String status);

	List<Transaction> findByPaymentTypeAndDeletedFalseOrderByCreatedAtDesc(String paymentType);

	Optional<Transaction> findByRazorpayOrderId(String razorpayOrderId);

	@Query("SELECT t FROM Transaction t WHERE t.createdAt BETWEEN :startDate AND :endDate " +
		   "AND t.deleted = false " +
		   "ORDER BY t.createdAt DESC")
	List<Transaction> findByDateRange(@Param("startDate") LocalDateTime startDate,
									   @Param("endDate") LocalDateTime endDate);

	@Query("SELECT SUM(t.platformMarkup) FROM Transaction t WHERE t.deleted = false")
	Double getTotalPlatformRevenue();

	@Query("SELECT SUM(t.platformMarkup) FROM Transaction t " +
		   "WHERE t.createdAt BETWEEN :startDate AND :endDate AND t.deleted = false")
	Double getTotalPlatformRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
											   @Param("endDate") LocalDateTime endDate);

	long countByUserIdAndDeletedFalse(Long userId);
	long countByStatusAndDeletedFalse(String status);
	long countByPaymentTypeAndDeletedFalse(String paymentType);
}
