package com.bitedash.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "platform_wallet", schema = "payment_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlatformWallet {
	@Id
	private Long id = 1L;

	@Column(precision = 15, scale = 2, nullable = false)
	private BigDecimal balance = BigDecimal.ZERO;

	@Column(name = "total_commission_earned", precision = 15, scale = 2)
	private BigDecimal totalCommissionEarned = BigDecimal.ZERO;

	@Column(name = "total_gateway_markup_earned", precision = 15, scale = 2)
	private BigDecimal totalGatewayMarkupEarned = BigDecimal.ZERO;

	@Column(name = "total_promotion_spent", precision = 15, scale = 2)
	private BigDecimal totalPromotionSpent = BigDecimal.ZERO;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt = LocalDateTime.now();

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public void addCommission(BigDecimal amount) {
		this.balance = this.balance.add(amount);
		this.totalCommissionEarned = this.totalCommissionEarned.add(amount);
	}

	public void addGatewayMarkup(BigDecimal amount) {
		this.balance = this.balance.add(amount);
		this.totalGatewayMarkupEarned = this.totalGatewayMarkupEarned.add(amount);
	}

	public void deductPromotionSpend(BigDecimal amount) {
		this.balance = this.balance.subtract(amount);
		this.totalPromotionSpent = this.totalPromotionSpent.add(amount);
	}

	public void addRevenue(BigDecimal amount) {
		this.balance = this.balance.add(amount);
	}

	public void deductExpense(BigDecimal amount) {
		this.balance = this.balance.subtract(amount);
	}
}
