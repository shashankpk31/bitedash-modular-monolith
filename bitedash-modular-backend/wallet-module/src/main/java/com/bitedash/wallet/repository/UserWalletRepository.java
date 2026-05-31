package com.bitedash.wallet.repository;

import com.bitedash.wallet.entity.UserWallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {

	Optional<UserWallet> findByUserIdAndDeletedFalse(Long userId);

	/**
	 * Find wallet with pessimistic write lock to prevent race conditions.
	 * Use this method for credit/debit operations to ensure ACID compliance.
	 */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT w FROM UserWallet w WHERE w.userId = :userId AND w.deleted = false")
	Optional<UserWallet> findByUserIdForUpdate(@Param("userId") Long userId);

	boolean existsByUserId(Long userId);
}
