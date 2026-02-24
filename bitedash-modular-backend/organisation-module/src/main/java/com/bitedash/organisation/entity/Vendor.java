package com.bitedash.organisation.entity;

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
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "vendors", schema = "organisation_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted = false")
public class Vendor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(name = "contact_person")
	private String contactPerson;

	@Column(name = "contact_number")
	private String contactNumber;

	@Column(name = "owner_user_id", unique = true)
	private Long ownerUserId;

	@Column(name = "is_active")
	private Boolean isActive = true;

	@OneToMany(mappedBy = "vendor", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	@JsonIgnoreProperties("vendor")
	private List<VendorCafeteriaMapping> cafeteriaMappings = new ArrayList<>();

	@OneToMany(mappedBy = "vendor", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	@JsonIgnoreProperties("vendor")
	private List<VendorOperatingHour> operatingHours = new ArrayList<>();

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

	public Vendor(Long id, String name, String contactPerson, String contactNumber, Long ownerUserId,
			Boolean isActive) {
		super();
		this.id = id;
		this.name = name;
		this.contactPerson = contactPerson;
		this.contactNumber = contactNumber;
		this.ownerUserId = ownerUserId;
		this.isActive = isActive;
	}

	public void addCafeteriaMapping(VendorCafeteriaMapping mapping) {
		cafeteriaMappings.add(mapping);
		mapping.setVendor(this);
	}

	public void removeCafeteriaMapping(VendorCafeteriaMapping mapping) {
		cafeteriaMappings.remove(mapping);
		mapping.setVendor(null);
	}

	public void addOperatingHour(VendorOperatingHour hour) {
		operatingHours.add(hour);
		hour.setVendor(this);
	}

	public void removeOperatingHour(VendorOperatingHour hour) {
		operatingHours.remove(hour);
		hour.setVendor(null);
	}
}
