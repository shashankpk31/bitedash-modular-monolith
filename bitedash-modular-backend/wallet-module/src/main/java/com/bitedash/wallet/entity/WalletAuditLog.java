package com.bitedash.wallet.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_log", schema = "wallet_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WalletAuditLog {
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
