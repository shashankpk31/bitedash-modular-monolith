package com.bitedash.organisation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bitedash.organisation.entity.OrganisationAuditLog;

public interface OrganisationAuditLogRepository extends JpaRepository<OrganisationAuditLog, Long> {

}
