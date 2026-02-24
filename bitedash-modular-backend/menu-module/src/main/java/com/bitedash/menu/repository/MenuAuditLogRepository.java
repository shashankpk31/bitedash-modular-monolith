package com.bitedash.menu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bitedash.menu.entity.MenuAuditLog;

public interface MenuAuditLogRepository extends JpaRepository<MenuAuditLog, Long> {
}
