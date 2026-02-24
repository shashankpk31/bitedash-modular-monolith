package com.bitedash.menu.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Type;

import com.bitedash.shared.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_items", schema = "menu_schema")
@NamedEntityGraph(
	name = "MenuItem.withCategory",
	attributeNodes = @NamedAttributeNode("category")
)
@NamedEntityGraph(
	name = "MenuItem.withAddons",
	attributeNodes = @NamedAttributeNode("addons")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "vendor_id", nullable = false)
	private Long vendorId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id")
	private Category category;

	@Column(nullable = false, length = 255)
	private String name;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(precision = 10, scale = 2, nullable = false)
	private BigDecimal price;

	@Column(name = "is_available")
	private Boolean isAvailable = true;

	@Column(name = "is_veg")
	private Boolean isVeg = true;

	@Column(name = "is_promoted")
	private Boolean isPromoted = false;

	@Column(name = "promotion_rank")
	private Integer promotionRank = 999;

	@Column(name = "promotion_start_date")
	private LocalDateTime promotionStartDate;

	@Column(name = "promotion_end_date")
	private LocalDateTime promotionEndDate;

	@Column(name = "promotion_type", length = 50)
	private String promotionType;

	@Column(name = "spice_level", length = 20)
	private String spiceLevel;

	@Column(name = "dietary_tags", columnDefinition = "jsonb")
	@Type(JsonType.class)
	private String dietaryTags;

	@Column(name = "popularity_score")
	private Integer popularityScore = 0;

	@Column(name = "display_order")
	private Integer displayOrder = 999;

	private Integer calories;

	@Column(name = "preparation_time_minutes")
	private Integer preparationTimeMinutes;

	@Column(name = "image_url", length = 500)
	private String imageUrl;

	@OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<MenuItemAddon> addons = new ArrayList<>();

	public void addAddon(MenuItemAddon addon) {
		addons.add(addon);
		addon.setMenuItem(this);
	}

	public void removeAddon(MenuItemAddon addon) {
		addons.remove(addon);
		addon.setMenuItem(null);
	}
}
