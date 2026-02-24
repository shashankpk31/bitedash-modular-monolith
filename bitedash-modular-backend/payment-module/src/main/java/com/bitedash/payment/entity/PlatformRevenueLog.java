package com.bitedash.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "platform_revenue_log", schema = "payment_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlatformRevenueLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "revenue_type", nullable = false, length = 50)
	private String revenueType;

	@Column(precision = 10, scale = 2, nullable = false)
	private BigDecimal amount;

	@Column(name = "order_id")
	private Long orderId;

	@Column(name = "payment_id")
	private Long paymentId;

	@Column(name = "vendor_id")
	private Long vendorId;

	@Column(name = "organization_id")
	private Long organizationId;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "deleted", nullable = false)
	private Boolean deleted = false;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public PlatformRevenueLog(String revenueType, BigDecimal amount, String description) {
		this.revenueType = revenueType;
		this.amount = amount;
		this.description = description;
	}

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public static PlatformRevenueLog commission(Long orderId, BigDecimal amount, Long vendorId, Long organizationId) {
		PlatformRevenueLog log = new PlatformRevenueLog();
		log.setRevenueType("COMMISSION");
		log.setOrderId(orderId);
		log.setAmount(amount);
		log.setVendorId(vendorId);
		log.setOrganizationId(organizationId);
		log.setDescription("Order commission from vendor");
		return log;
	}

	public static PlatformRevenueLog gatewayMarkup(Long paymentId, BigDecimal amount, Long userId) {
		PlatformRevenueLog log = new PlatformRevenueLog();
		log.setRevenueType("GATEWAY_MARKUP");
		log.setPaymentId(paymentId);
		log.setAmount(amount);
		log.setDescription("Gateway markup on wallet recharge");
		return log;
	}

	public static PlatformRevenueLog promotionRevenue(Long vendorId, BigDecimal amount, String promoType) {
		PlatformRevenueLog log = new PlatformRevenueLog();
		log.setRevenueType("PROMOTION_REVENUE");
		log.setVendorId(vendorId);
		log.setAmount(amount);
		log.setDescription("Promotion purchase: " + promoType);
		return log;
	}
}
