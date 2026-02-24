package com.bitedash.organisation.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audit_log", schema = "organisation_schema")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrganisationAuditLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String entityName;
	private String entityId;
	private String action;
	private String changedBy;
	private LocalDateTime timestamp;
	@Column(columnDefinition = "TEXT")
	private String details;
}
