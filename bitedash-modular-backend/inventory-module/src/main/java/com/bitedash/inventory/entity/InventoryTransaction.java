package com.bitedash.inventory.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_transactions", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransaction {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "inventory_id", nullable = false)
	private Inventory inventory;

	@Column(name = "transaction_type", nullable = false, length = 50)
	private String transactionType;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal quantity;

	@Column(nullable = false, length = 50)
	private String unit;

	@Column(name = "balance_before", nullable = false, precision = 10, scale = 2)
	private BigDecimal balanceBefore;

	@Column(name = "balance_after", nullable = false, precision = 10, scale = 2)
	private BigDecimal balanceAfter;

	@Column(name = "cost_per_unit", precision = 10, scale = 2)
	private BigDecimal costPerUnit = BigDecimal.ZERO;

	@Column(name = "total_cost", precision = 10, scale = 2)
	private BigDecimal totalCost = BigDecimal.ZERO;

	@Column(name = "reference_type", length = 50)
	private String referenceType;

	@Column(name = "reference_id")
	private Long referenceId;

	@Column(columnDefinition = "TEXT")
	private String remarks;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	private Boolean deleted = false;

	public InventoryTransaction(Inventory inventory, String transactionType, BigDecimal quantity, String unit) {
		this.inventory = inventory;
		this.transactionType = transactionType;
		this.quantity = quantity;
		this.unit = unit;
	}

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}
}
