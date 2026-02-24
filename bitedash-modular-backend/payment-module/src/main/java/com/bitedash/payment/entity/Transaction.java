package com.bitedash.payment.entity;

import java.math.BigDecimal;

import com.bitedash.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "payments", schema = "payment_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends BaseEntity {

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "order_id", nullable = false)
	private Long orderId;

	@Column(precision = 10, scale = 2, nullable = false)
	private BigDecimal amount;

	@Column(name = "gateway_fee", precision = 10, scale = 2)
	private BigDecimal gatewayFee = BigDecimal.ZERO;

	@Column(name = "platform_markup", precision = 10, scale = 2)
	private BigDecimal platformMarkup = BigDecimal.ZERO;

	@Column(name = "total_charged", precision = 10, scale = 2, nullable = false)
	private BigDecimal totalCharged;

	@Column(name = "payment_type", length = 50)
	private String paymentType = "ORDER_PAYMENT";

	@Column(length = 10)
	private String currency = "INR";

	@Column(name = "razorpay_order_id", unique = true, length = 255)
	private String razorpayOrderId;

	@Column(name = "razorpay_payment_id", length = 255)
	private String razorpayPaymentId;

	@Column(name = "razorpay_signature", columnDefinition = "TEXT")
	private String razorpaySignature;

	@Column(name = "payment_method", length = 50)
	private String paymentMethod;

	@Column(length = 50)
	private String status = "PENDING";

	public void calculateTotalCharged() {
		this.totalCharged = amount.add(gatewayFee).add(platformMarkup);
	}
}
