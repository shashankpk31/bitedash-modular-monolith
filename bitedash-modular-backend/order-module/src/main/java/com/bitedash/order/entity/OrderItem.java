package com.bitedash.order.entity;

import java.math.BigDecimal;

import com.bitedash.shared.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "order_items", schema = "order_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "order_id", nullable = false)
	private Order order;

	@Column(name = "menu_item_id", nullable = false)
	private Long menuItemId;

	@Column(name = "menu_item_name", length = 200)
	private String menuItemName;

	@Column(name = "addon_ids", columnDefinition = "TEXT")
	private String addonIds;

	@Column(name = "customizations", columnDefinition = "jsonb")
	@Type(JsonType.class)
	private String customizations;

	@Column(nullable = false)
	private Integer quantity = 1;

	@Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
	private BigDecimal unitPrice;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@Column(precision = 10, scale = 2)
	private BigDecimal subtotal;
}
