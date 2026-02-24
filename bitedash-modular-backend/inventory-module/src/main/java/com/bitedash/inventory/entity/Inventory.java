package com.bitedash.inventory.entity;

import com.bitedash.shared.entity.BaseEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "inventories", schema = "inventory_schema")
@NamedEntityGraph(
	name = "Inventory.withTransactions",
	attributeNodes = @NamedAttributeNode("transactions")
)
@NamedEntityGraph(
	name = "Inventory.withAlerts",
	attributeNodes = @NamedAttributeNode("alerts")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Inventory extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "item_name", nullable = false, length = 200)
	private String itemName;

	@Column(name = "cafeteria_id", nullable = false)
	private Long cafeteriaId;

	@Column(name = "vendor_id")
	private Long vendorId;

	@Column(name = "stock_quantity", precision = 10, scale = 2)
	private BigDecimal stockQuantity = BigDecimal.ZERO;

	@Column(length = 50)
	private String unit = "pieces";

	@Column(name = "min_stock_level", precision = 10, scale = 2)
	private BigDecimal minStockLevel = new BigDecimal("10.00");

	@Column(name = "max_stock_level", precision = 10, scale = 2)
	private BigDecimal maxStockLevel = new BigDecimal("100.00");

	@Column(name = "reorder_quantity", precision = 10, scale = 2)
	private Integer reorderQuantity = Integer.valueOf(50);

	@Column(name = "cost_per_unit", precision = 10, scale = 2)
	private BigDecimal costPerUnit = BigDecimal.ZERO;

	@Column(name = "supplier_name", length = 200)
	private String supplierName;

	@Column(name = "supplier_contact", length = 100)
	private String supplierContact;

	@Column(name = "last_restocked_at")
	private LocalDateTime lastRestockedAt;

	@Column(name = "expiry_date")
	private LocalDate expiryDate;

	@Column(name = "storage_location", length = 100)
	private String storageLocation;

	@Column(name = "stock_status", length = 50)
	private String stockStatus = "IN_STOCK";

	@Column(name = "is_available")
	private Boolean isAvailable = true;

	@OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<InventoryTransaction> transactions = new ArrayList<>();

	@OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<InventoryAlert> alerts = new ArrayList<>();


	public void addTransaction(InventoryTransaction transaction) {
		transactions.add(transaction);
		transaction.setInventory(this);
	}

	public void addAlert(InventoryAlert alert) {
		alerts.add(alert);
		alert.setInventory(this);
	}

	public void updateStockStatus() {
		if (expiryDate != null && expiryDate.isBefore(LocalDate.now())) {
			this.stockStatus = "EXPIRED";
			this.isAvailable = false;
		} else if (stockQuantity.compareTo(BigDecimal.ZERO) <= 0) {
			this.stockStatus = "OUT_OF_STOCK";
			this.isAvailable = false;
		} else if (stockQuantity.compareTo(minStockLevel) <= 0) {
			this.stockStatus = "LOW_STOCK";
			this.isAvailable = true;
		} else {
			this.stockStatus = "IN_STOCK";
			this.isAvailable = true;
		}
	}

	public boolean needsReorder() {
		return stockQuantity.compareTo(minStockLevel) <= 0 &&
			   stockQuantity.compareTo(BigDecimal.ZERO) > 0;
	}

	public boolean isExpired() {
		return expiryDate != null && expiryDate.isBefore(LocalDate.now());
	}

	public boolean isExpiringSoon(int daysThreshold) {
		return expiryDate != null &&
			   expiryDate.isBefore(LocalDate.now().plusDays(daysThreshold));
	}
}
