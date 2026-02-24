package com.bitedash.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bitedash.identity.entity.IdentityAuditLog;

public interface IdentityAuditLogRepository extends JpaRepository<IdentityAuditLog, Long> {

}
