package com.bitedash.order.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.bitedash.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "orders", schema = "order_schema")
@NamedEntityGraph(
	name = "Order.withItems",
	attributeNodes = @NamedAttributeNode("orderItems")
)
@NamedEntityGraph(
	name = "Order.withHistory",
	attributeNodes = @NamedAttributeNode("statusHistory")
)
@NamedEntityGraph(
	name = "Order.full",
	attributeNodes = {
		@NamedAttributeNode("orderItems"),
		@NamedAttributeNode("statusHistory")
	}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

	@Column(unique = true, nullable = false, length = 50)
	private String orderNumber;

	@Column(unique = true, length = 500)
	private String qrCodeData;

	private Long userId;
	private Long vendorId;
	private Long cafeteriaId;
	private Long officeId;
	private Long organizationId;

	@Column(precision = 10, scale = 2, nullable = false)
	private BigDecimal totalAmount;

	@Column(precision = 10, scale = 2)
	private BigDecimal platformCommission = BigDecimal.ZERO;

	@Column(precision = 10, scale = 2)
	private BigDecimal vendorPayout = BigDecimal.ZERO;

	@Column(precision = 10, scale = 2)
	private BigDecimal deliveryFee = BigDecimal.ZERO;

	@Column(precision = 5, scale = 4)
	private BigDecimal commissionRate = new BigDecimal("0.15");

	@Column(length = 50)
	private String status = "PENDING";

	@Column(length = 50)
	private String orderType = "DINE_IN";

	@Column(length = 6)
	private String pickupOtp;

	private LocalDateTime scheduledTime;

	private Integer preparationTime;

	@Column(columnDefinition = "TEXT")
	private String specialInstructions;

	private Integer rating;

	@Column(columnDefinition = "TEXT")
	private String feedback;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<OrderItem> orderItems = new ArrayList<>();

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<OrderStatusHistory> statusHistory = new ArrayList<>();

	public void addOrderItem(OrderItem item) {
		orderItems.add(item);
		item.setOrder(this);
	}

	public void removeOrderItem(OrderItem item) {
		orderItems.remove(item);
		item.setOrder(null);
	}

	public void addStatusHistory(OrderStatusHistory history) {
		statusHistory.add(history);
		history.setOrder(this);
	}
}
