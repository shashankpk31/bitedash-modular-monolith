package com.bitedash.menu.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "promotion_analytics", schema = "menu_schema", uniqueConstraints = @UniqueConstraint(columnNames = { "promotion_id", "date" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PromotionAnalytics {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "promotion_id", nullable = false)
	private Promotion promotion;

	@Column(nullable = false)
	private LocalDate date;

	private Integer impressions = 0;

	private Integer clicks = 0;

	private Integer orders = 0;

	@Column(name = "revenue_generated", precision = 10, scale = 2)
	private BigDecimal revenueGenerated = BigDecimal.ZERO;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public PromotionAnalytics(Promotion promotion, LocalDate date) {
		this.promotion = promotion;
		this.date = date;
	}

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public void incrementImpressions() {
		this.impressions++;
	}

	public void incrementClicks() {
		this.clicks++;
	}

	public void incrementOrders() {
		this.orders++;
	}

	public void addRevenue(BigDecimal revenue) {
		this.revenueGenerated = this.revenueGenerated.add(revenue);
	}
}
