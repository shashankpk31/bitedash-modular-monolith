package com.bitedash.wallet.repository;

import com.bitedash.wallet.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

	List<WalletTransaction> findByWalletIdAndDeletedFalseOrderByCreatedAtDesc(Long walletId);

	List<WalletTransaction> findByWalletIdAndTxnTypeAndDeletedFalseOrderByCreatedAtDesc(Long walletId, String txnType);

	List<WalletTransaction> findByReferenceIdAndReferenceTypeAndDeletedFalse(Long referenceId, String referenceType);

	@Query("SELECT wt FROM WalletTransaction wt WHERE wt.walletId = :walletId " +
		   "AND wt.createdAt BETWEEN :startDate AND :endDate " +
		   "AND wt.deleted = false " +
		   "ORDER BY wt.createdAt DESC")
	List<WalletTransaction> findByWalletIdAndDateRange(@Param("walletId") Long walletId,
														@Param("startDate") LocalDateTime startDate,
														@Param("endDate") LocalDateTime endDate);

	@Query("SELECT wt FROM WalletTransaction wt WHERE wt.walletId = :walletId " +
		   "AND wt.deleted = false " +
		   "ORDER BY wt.createdAt ASC")
	List<WalletTransaction> getBalanceHistory(@Param("walletId") Long walletId);

	@Query("SELECT wt FROM WalletTransaction wt WHERE wt.walletId = :walletId " +
		   "AND wt.createdAt BETWEEN :startDate AND :endDate " +
		   "AND wt.deleted = false " +
		   "ORDER BY wt.createdAt ASC")
	List<WalletTransaction> getBalanceHistoryByDateRange(@Param("walletId") Long walletId,
														  @Param("startDate") LocalDateTime startDate,
														  @Param("endDate") LocalDateTime endDate);

	@Query("SELECT SUM(wt.amount) FROM WalletTransaction wt WHERE wt.walletId = :walletId " +
		   "AND wt.txnType = 'CREDIT' AND wt.deleted = false")
	Double getTotalCreditsByWallet(@Param("walletId") Long walletId);

	@Query("SELECT SUM(wt.amount) FROM WalletTransaction wt WHERE wt.walletId = :walletId " +
		   "AND wt.txnType = 'DEBIT' AND wt.deleted = false")
	Double getTotalDebitsByWallet(@Param("walletId") Long walletId);

	long countByWalletIdAndDeletedFalse(Long walletId);
	long countByWalletIdAndTxnTypeAndDeletedFalse(Long walletId, String txnType);
}
