package com.bitedash.wallet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bitedash.wallet.entity.WalletAuditLog;

@Repository
public interface WalletAuditLogRepository extends JpaRepository<WalletAuditLog, Long> {

}
