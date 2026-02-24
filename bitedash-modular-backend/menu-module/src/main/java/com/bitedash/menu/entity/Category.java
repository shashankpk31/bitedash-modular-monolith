package com.bitedash.menu.entity;

import java.util.ArrayList;
import java.util.List;

import com.bitedash.shared.entity.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "categories", schema = "menu_schema")
@NamedEntityGraph(
	name = "Category.withMenuItems",
	attributeNodes = @NamedAttributeNode("menuItems")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "vendor_id", nullable = false)
	private Long vendorId;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "display_order")
	private Integer displayOrder = 999;

	@Column(name = "icon_url", length = 500)
	private String iconUrl;

	@Column(name = "is_featured")
	private Boolean isFeatured = false;

	@OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<MenuItem> menuItems = new ArrayList<>();

	public void addMenuItem(MenuItem menuItem) {
		menuItems.add(menuItem);
		menuItem.setCategory(this);
	}

	public void removeMenuItem(MenuItem menuItem) {
		menuItems.remove(menuItem);
		menuItem.setCategory(null);
	}
}
