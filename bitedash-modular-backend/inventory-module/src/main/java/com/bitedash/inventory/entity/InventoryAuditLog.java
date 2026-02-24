package com.bitedash.inventory.entity;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_log", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAuditLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "entity_name")
	private String entityName;

	@Column(name = "entity_id")
	private String entityId;

	private String action;

	@Column(name = "changed_by")
	private String changedBy;

	private LocalDateTime timestamp;

	@Column(columnDefinition = "TEXT")
	private String details;
}
