package com.bitedash.wallet.service;

import com.bitedash.wallet.dto.response.BalanceHistoryResponse;
import com.bitedash.wallet.dto.response.UserWalletResponse;
import com.bitedash.wallet.dto.response.WalletTransactionResponse;
import com.bitedash.wallet.entity.UserWallet;
import com.bitedash.wallet.entity.WalletTransaction;
import com.bitedash.wallet.repository.UserWalletRepository;
import com.bitedash.wallet.repository.WalletTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletService {

	private static final Logger log = LoggerFactory.getLogger(WalletService.class);

	@Autowired
	private UserWalletRepository userWalletRepository;

	@Autowired
	private WalletTransactionRepository transactionRepository;

	@Transactional
	public UserWalletResponse initWallet(Long userId) {
		log.info("Initializing wallet for user: {}", userId);

		if (userWalletRepository.existsByUserId(userId)) {
			throw new RuntimeException("Wallet already exists for user: " + userId);
		}

		UserWallet wallet = new UserWallet();
		wallet.setUserId(userId);
		wallet.setBalance(BigDecimal.ZERO);
		wallet = userWalletRepository.save(wallet);

		log.info("Wallet initialized successfully for user: {}", userId);
		return toWalletResponse(wallet);
	}

	public UserWalletResponse getWalletByUserId(Long userId) {
		log.info("Fetching wallet for user: {}", userId);
		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));
		return toWalletResponse(wallet);
	}

	@Transactional
	public WalletTransactionResponse credit(Long userId, BigDecimal amount, String description,
											 Long referenceId, String referenceType) {
		log.info("Crediting wallet for user: {}, amount: {}", userId, amount);

		if (amount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new RuntimeException("Credit amount must be positive");
		}

		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

		BigDecimal balanceBefore = wallet.getBalance();
		BigDecimal balanceAfter = balanceBefore.add(amount);

		wallet.setBalance(balanceAfter);
		userWalletRepository.save(wallet);

		WalletTransaction transaction = new WalletTransaction(
			wallet.getId(),
			amount,
			"CREDIT",
			balanceBefore,
			balanceAfter
		);
		transaction.setDescription(description);
		transaction.setReferenceId(referenceId);
		transaction.setReferenceType(referenceType);
		transaction.setStatus("SUCCESS");
		transaction = transactionRepository.save(transaction);

		log.info("Wallet credited successfully. New balance: {}", balanceAfter);
		return toTransactionResponse(transaction);
	}

	@Transactional
	public WalletTransactionResponse debit(Long userId, BigDecimal amount, String description,
											Long referenceId, String referenceType) {
		log.info("Debiting wallet for user: {}, amount: {}", userId, amount);

		if (amount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new RuntimeException("Debit amount must be positive");
		}

		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

		BigDecimal balanceBefore = wallet.getBalance();

		if (balanceBefore.compareTo(amount) < 0) {
			throw new RuntimeException("Insufficient wallet balance. Current balance: " + balanceBefore);
		}

		BigDecimal balanceAfter = balanceBefore.subtract(amount);

		wallet.setBalance(balanceAfter);
		userWalletRepository.save(wallet);

		WalletTransaction transaction = new WalletTransaction(
			wallet.getId(),
			amount,
			"DEBIT",
			balanceBefore,
			balanceAfter
		);
		transaction.setDescription(description);
		transaction.setReferenceId(referenceId);
		transaction.setReferenceType(referenceType);
		transaction.setStatus("SUCCESS");
		transaction = transactionRepository.save(transaction);

		log.info("Wallet debited successfully. New balance: {}", balanceAfter);
		return toTransactionResponse(transaction);
	}

	public List<WalletTransactionResponse> getTransactions(Long userId) {
		log.info("Fetching transactions for user: {}", userId);

		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

		List<WalletTransaction> transactions = transactionRepository
			.findByWalletIdAndDeletedFalseOrderByCreatedAtDesc(wallet.getId());

		return transactions.stream()
			.map(this::toTransactionResponse)
			.collect(Collectors.toList());
	}

	public List<BalanceHistoryResponse> getBalanceHistory(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
		log.info("Fetching balance history for user: {} from {} to {}", userId, startDate, endDate);

		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

		List<WalletTransaction> transactions;
		if (startDate != null && endDate != null) {
			transactions = transactionRepository.getBalanceHistoryByDateRange(wallet.getId(), startDate, endDate);
		} else {
			transactions = transactionRepository.getBalanceHistory(wallet.getId());
		}

		return transactions.stream()
			.map(txn -> {
				BigDecimal change = "CREDIT".equals(txn.getTxnType()) ? txn.getAmount() : txn.getAmount().negate();
				return new BalanceHistoryResponse(
					txn.getCreatedAt(),
					txn.getBalanceAfter(),
					change,
					txn.getTxnType(),
					txn.getDescription()
				);
			})
			.collect(Collectors.toList());
	}

	public BigDecimal getBalance(Long userId) {
		log.info("Fetching balance for user: {}", userId);
		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));
		return wallet.getBalance();
	}

	public BigDecimal getTotalCredits(Long userId) {
		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

		Double total = transactionRepository.getTotalCreditsByWallet(wallet.getId());
		return total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO;
	}

	public BigDecimal getTotalDebits(Long userId) {
		UserWallet wallet = userWalletRepository.findByUserIdAndDeletedFalse(userId)
			.orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

		Double total = transactionRepository.getTotalDebitsByWallet(wallet.getId());
		return total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO;
	}

	private UserWalletResponse toWalletResponse(UserWallet wallet) {
		UserWalletResponse response = new UserWalletResponse();
		response.setId(wallet.getId());
		response.setUserId(wallet.getUserId());
		response.setBalance(wallet.getBalance());
		response.setCreatedAt(wallet.getCreatedAt());
		response.setUpdatedAt(wallet.getUpdatedAt());
		return response;
	}

	private WalletTransactionResponse toTransactionResponse(WalletTransaction transaction) {
		WalletTransactionResponse response = new WalletTransactionResponse();
		response.setId(transaction.getId());
		response.setWalletId(transaction.getWalletId());
		response.setAmount(transaction.getAmount());
		response.setBalanceBefore(transaction.getBalanceBefore());
		response.setBalanceAfter(transaction.getBalanceAfter());
		response.setTxnType(transaction.getTxnType());
		response.setReferenceId(transaction.getReferenceId());
		response.setReferenceType(transaction.getReferenceType());
		response.setStatus(transaction.getStatus());
		response.setDescription(transaction.getDescription());
		response.setProviderReferenceId(transaction.getProviderReferenceId());
		response.setCreatedAt(transaction.getCreatedAt());
		return response;
	}
}
