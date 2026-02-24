package com.bitedash.menu.entity;

import java.math.BigDecimal;

import com.bitedash.shared.entity.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_item_addons", schema = "menu_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemAddon extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "menu_item_id", nullable = false)
	private MenuItem menuItem;

	@Column(name = "addon_name", nullable = false, length = 255)
	private String addonName;

	@Column(name = "extra_price", precision = 10, scale = 2)
	private BigDecimal extraPrice = BigDecimal.ZERO;

	@Column(name = "is_available")
	private Boolean isAvailable = true;
}
