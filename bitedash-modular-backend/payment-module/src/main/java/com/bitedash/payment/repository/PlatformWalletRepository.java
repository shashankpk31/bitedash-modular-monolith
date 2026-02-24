package com.bitedash.payment.repository;

import com.bitedash.payment.entity.PlatformWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformWalletRepository extends JpaRepository<PlatformWallet, Long> {

	@Query("SELECT pw FROM PlatformWallet pw WHERE pw.id = 1")
	Optional<PlatformWallet> findPlatformWallet();

	default boolean platformWalletExists() {
		return existsById(1L);
	}

	default PlatformWallet getOrCreatePlatformWallet() {
		return findPlatformWallet().orElseGet(() -> {
			PlatformWallet wallet = new PlatformWallet();
			wallet.setId(1L);
			return save(wallet);
		});
	}
}
