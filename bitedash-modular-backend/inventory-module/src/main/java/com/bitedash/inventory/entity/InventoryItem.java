package com.bitedash.inventory.entity;

import com.bitedash.shared.entity.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "inventory_items", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "menu_item_id")
	private Long menuItemId;

	@Column(name = "vendor_id")
	private Long vendorId;

	@Column(name = "available_quantity")
	private Integer availableQuantity;

	@Column(name = "reserved_quantity")
	private Integer reservedQuantity;

	@Column(name = "threshold_limit")
	private Integer thresholdLimit;
}
