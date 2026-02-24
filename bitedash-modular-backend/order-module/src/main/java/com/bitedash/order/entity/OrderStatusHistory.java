package com.bitedash.order.entity;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "order_status_history", schema = "order_schema")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusHistory {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "order_id", nullable = false)
	private Order order;

	@Column(length = 50)
	private String previousStatus;

	@Column(length = 50, nullable = false)
	private String newStatus;

	private Long changedBy;

	@Column(length = 50)
	private String changedByRole;

	@Column(columnDefinition = "TEXT")
	private String remarks;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}
}
