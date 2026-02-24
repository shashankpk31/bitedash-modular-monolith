package com.bitedash.menu.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.bitedash.shared.entity.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "promotions", schema = "menu_schema")
@NamedEntityGraph(
	name = "Promotion.withMenuItem",
	attributeNodes = @NamedAttributeNode("menuItem")
)
@NamedEntityGraph(
	name = "Promotion.withAnalytics",
	attributeNodes = @NamedAttributeNode("analytics")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Promotion extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "vendor_id", nullable = false)
	private Long vendorId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "menu_item_id")
	private MenuItem menuItem;

	@Column(name = "promotion_type", nullable = false, length = 50)
	private String promotionType;

	@Column(name = "start_date", nullable = false)
	private LocalDateTime startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDateTime endDate;

	@Column(name = "price_paid", precision = 10, scale = 2, nullable = false)
	private BigDecimal pricePaid;

	private Integer impressions = 0;

	private Integer clicks = 0;

	@Column(name = "orders_generated")
	private Integer ordersGenerated = 0;

	@Column(length = 50)
	private String status = "ACTIVE";

	@OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<PromotionAnalytics> analytics = new ArrayList<>();

	public void addAnalytics(PromotionAnalytics analytic) {
		analytics.add(analytic);
		analytic.setPromotion(this);
	}

	public void incrementImpressions() {
		this.impressions++;
	}

	public void incrementClicks() {
		this.clicks++;
	}

	public void incrementOrdersGenerated() {
		this.ordersGenerated++;
	}
}
