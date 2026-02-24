package com.bitedash.inventory.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "purchase_order_items", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "purchase_order_id", nullable = false)
	private PurchaseOrder purchaseOrder;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "inventory_id", nullable = false)
	private Inventory inventory;

	@Column(name = "item_name", nullable = false, length = 200)
	private String itemName;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal quantity;

	@Column(nullable = false, length = 50)
	private String unit;

	@Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 2)
	private BigDecimal costPerUnit;

	@Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalCost;

	@Column(name = "received_quantity", precision = 10, scale = 2)
	private BigDecimal receivedQuantity = BigDecimal.ZERO;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	private Boolean deleted = false;

	public PurchaseOrderItem(PurchaseOrder purchaseOrder, Inventory inventory, String itemName, BigDecimal quantity,
			String unit, BigDecimal costPerUnit) {
		this.purchaseOrder = purchaseOrder;
		this.inventory = inventory;
		this.itemName = itemName;
		this.quantity = quantity;
		this.unit = unit;
		this.costPerUnit = costPerUnit;
		this.totalCost = quantity.multiply(costPerUnit);
	}

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
		calculateTotalCost();
	}

	public void calculateTotalCost() {
		if (quantity != null && costPerUnit != null) {
			this.totalCost = quantity.multiply(costPerUnit);
		}
	}

	public void receiveQuantity(BigDecimal received) {
		this.receivedQuantity = this.receivedQuantity.add(received);
	}

	public boolean isFullyReceived() {
		return receivedQuantity.compareTo(quantity) >= 0;
	}
}
