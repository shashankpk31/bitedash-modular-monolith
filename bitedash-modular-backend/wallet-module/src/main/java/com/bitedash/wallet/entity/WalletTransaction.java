package com.bitedash.wallet.entity;

import java.math.BigDecimal;

import com.bitedash.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "wallet_transactions", schema = "wallet_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction extends BaseEntity {

	@Column(name = "wallet_id")
	private Long walletId;

	@Column(precision = 15, scale = 2, nullable = false)
	private BigDecimal amount;

	@Column(name = "balance_before", precision = 15, scale = 2)
	private BigDecimal balanceBefore;

	@Column(name = "balance_after", precision = 15, scale = 2)
	private BigDecimal balanceAfter;

	@Column(name = "txn_type", nullable = false, length = 20)
	private String txnType;

	@Column(name = "reference_id")
	private Long referenceId;

	@Column(name = "reference_type", length = 50)
	private String referenceType;

	@Column(length = 50)
	private String status = "SUCCESS";

	@Column(length = 255)
	private String description;

	@Column(name = "provider_reference_id", length = 255)
	private String providerReferenceId;

	public WalletTransaction(Long walletId, BigDecimal amount, String txnType, BigDecimal balanceBefore, BigDecimal balanceAfter) {
		this.walletId = walletId;
		this.amount = amount;
		this.txnType = txnType;
		this.balanceBefore = balanceBefore;
		this.balanceAfter = balanceAfter;
	}
}
