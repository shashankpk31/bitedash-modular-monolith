package com.bitedash.wallet.entity;

import java.math.BigDecimal;

import com.bitedash.shared.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "user_wallets", schema = "wallet_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserWallet extends BaseEntity {
	private Long userId;
	private BigDecimal balance;
}
