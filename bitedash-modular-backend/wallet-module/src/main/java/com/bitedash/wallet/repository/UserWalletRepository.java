package com.bitedash.wallet.repository;

import com.bitedash.wallet.entity.UserWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {

	Optional<UserWallet> findByUserIdAndDeletedFalse(Long userId);

	boolean existsByUserId(Long userId);
}
