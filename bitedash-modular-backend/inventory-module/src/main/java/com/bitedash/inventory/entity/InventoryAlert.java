package com.bitedash.inventory.entity;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_alerts", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAlert {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "inventory_id", nullable = false)
	private Inventory inventory;

	@Column(name = "alert_type", nullable = false, length = 50)
	private String alertType;

	@Column(name = "alert_message", nullable = false, columnDefinition = "TEXT")
	private String alertMessage;

	@Column(length = 20)
	private String severity = "INFO";

	@Column(name = "is_acknowledged")
	private Boolean isAcknowledged = false;

	@Column(name = "acknowledged_by")
	private String acknowledgedBy;

	@Column(name = "acknowledged_at")
	private LocalDateTime acknowledgedAt;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	private Boolean deleted = false;

	public InventoryAlert(Inventory inventory, String alertType, String alertMessage, String severity) {
		this.inventory = inventory;
		this.alertType = alertType;
		this.alertMessage = alertMessage;
		this.severity = severity;
	}

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public void acknowledge(String acknowledgedBy) {
		this.isAcknowledged = true;
		this.acknowledgedBy = acknowledgedBy;
		this.acknowledgedAt = LocalDateTime.now();
	}
}
