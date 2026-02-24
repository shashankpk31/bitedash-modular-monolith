package com.bitedash.inventory.entity;

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
@Table(name = "purchase_orders", schema = "inventory_schema")
@NamedEntityGraph(name = "PurchaseOrder.withItems", attributeNodes = @NamedAttributeNode("items"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "po_number", unique = true, nullable = false, length = 100)
	private String poNumber;

	@Column(name = "cafeteria_id", nullable = false)
	private Long cafeteriaId;

	@Column(name = "supplier_name", nullable = false, length = 200)
	private String supplierName;

	@Column(name = "supplier_contact", length = 100)
	private String supplierContact;

	@Column(name = "order_date", nullable = false)
	private LocalDate orderDate = LocalDate.now();

	@Column(name = "expected_delivery_date")
	private LocalDate expectedDeliveryDate;

	@Column(name = "actual_delivery_date")
	private LocalDate actualDeliveryDate;

	@Column(name = "total_amount", precision = 10, scale = 2)
	private BigDecimal totalAmount = BigDecimal.ZERO;

	@Column(length = 50)
	private String status = "PENDING";

	@Column(name = "approved_by")
	private Long approvedBy;

	@Column(name = "approved_at")
	private LocalDateTime approvedAt;

	@Column(name = "created_by", nullable = false)
	private String createdBy;

	@Column(columnDefinition = "TEXT")
	private String remarks;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	private Boolean deleted = false;

	@OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<PurchaseOrderItem> items = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
		if (orderDate == null) {
			orderDate = LocalDate.now();
		}
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public void addItem(PurchaseOrderItem item) {
		items.add(item);
		item.setPurchaseOrder(this);
		recalculateTotal();
	}

	public void removeItem(PurchaseOrderItem item) {
		items.remove(item);
		item.setPurchaseOrder(null);
		recalculateTotal();
	}

	public void recalculateTotal() {
		this.totalAmount = items.stream().map(PurchaseOrderItem::getTotalCost).reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	public void approve(Long userId) {
		this.status = "APPROVED";
		this.approvedBy = userId;
		this.approvedAt = LocalDateTime.now();
	}

	public void markAsReceived() {
		this.status = "RECEIVED";
		this.actualDeliveryDate = LocalDate.now();
	}

	public void cancel() {
		this.status = "CANCELLED";
	}
}
