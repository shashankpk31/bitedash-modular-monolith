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
@Table(name = "offices", schema = "organisation_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted = false")
public class Office {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "location_id", nullable = false)
	@JsonIgnoreProperties("offices")
	private Location location;

	@Column(name = "office_name", nullable = false)
	private String officeName;

	@Column(columnDefinition = "TEXT")
	private String address;

	@Column(name = "total_floors")
	private Integer totalFloors;

	@OneToMany(mappedBy = "office", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	@JsonIgnoreProperties("office")
	private List<Cafeteria> cafeterias = new ArrayList<>();

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

	public void addCafeteria(Cafeteria cafeteria) {
		cafeterias.add(cafeteria);
		cafeteria.setOffice(this);
	}

	public void removeCafeteria(Cafeteria cafeteria) {
		cafeterias.remove(cafeteria);
		cafeteria.setOffice(null);
	}
}
