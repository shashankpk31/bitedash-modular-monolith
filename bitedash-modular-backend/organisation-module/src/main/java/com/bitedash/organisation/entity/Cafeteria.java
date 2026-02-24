package com.bitedash.organisation.entity;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.EntityListeners;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

@Entity
@Table(name = "cafeterias", schema = "organisation_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted = false")
public class Cafeteria {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "office_id", nullable = false)
	@JsonIgnoreProperties("cafeterias")
	private Office office;

	@Column(nullable = false)
	private String name;

	@Column(name = "floor_number")
	private Integer floorNumber;

	private Integer capacity;

	@Column(name = "opening_time")
	private LocalTime openingTime;

	@Column(name = "closing_time")
	private LocalTime closingTime;

	@Column(name = "is_active")
	private Boolean isActive = true;

	@OneToMany(mappedBy = "cafeteria", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	@JsonIgnoreProperties("cafeteria")
	private List<VendorCafeteriaMapping> vendorMappings = new ArrayList<>();

	// Audit fields
	@CreatedDate
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@LastModifiedDate
	@Column(insertable = false)
	private LocalDateTime updatedAt;

	@CreatedBy
	@Column(nullable = false, updatable = false)
	private String createdBy;

	@LastModifiedBy
	@Column(insertable = false)
	private String updatedBy;

	@Column(nullable = false)
	private Boolean deleted = false;

	public Cafeteria(Long id, Office office, String name, Integer floorNumber, Integer capacity,
			LocalTime openingTime, LocalTime closingTime, Boolean isActive) {
		super();
		this.id = id;
		this.office = office;
		this.name = name;
		this.floorNumber = floorNumber;
		this.capacity = capacity;
		this.openingTime = openingTime;
		this.closingTime = closingTime;
		this.isActive = isActive;
	}

	public void addVendorMapping(VendorCafeteriaMapping mapping) {
		vendorMappings.add(mapping);
		mapping.setCafeteria(this);
	}

	public void removeVendorMapping(VendorCafeteriaMapping mapping) {
		vendorMappings.remove(mapping);
		mapping.setCafeteria(null);
	}
}
