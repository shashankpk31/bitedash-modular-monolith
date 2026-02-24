package com.bitedash.wallet.controller;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;
import com.bitedash.wallet.dto.response.BalanceHistoryResponse;
import com.bitedash.wallet.dto.response.UserWalletResponse;
import com.bitedash.wallet.dto.response.WalletTransactionResponse;
import com.bitedash.wallet.service.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/wallet")
public class WalletController {

	private static final Logger log = LoggerFactory.getLogger(WalletController.class);

	@Autowired
	private WalletService walletService;

	/**
	 * Helper method to get current user ID from context
	 */
	private Long getCurrentUserId() {
		return UserContext.get().userId();
	}

	/**
	 * Helper method to get current user role from context
	 */
	private String getCurrentUserRole() {
		return UserContext.get().role();
	}

	/**
	 * Helper method to check if current user is admin
	 */
	private boolean isCurrentUserAdmin() {
		String role = getCurrentUserRole();
		return "ROLE_SUPER_ADMIN".equals(role) || "ROLE_ORG_ADMIN".equals(role);
	}

	@PostMapping("/init/{userId}")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> initWallet(@PathVariable Long userId) {
		try {
			log.info("Initializing wallet for user: {}", userId);
			UserWalletResponse wallet = walletService.initWallet(userId);
			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse(true, "Wallet initialized successfully", wallet));
		} catch (Exception e) {
			log.error("Error initializing wallet: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<ApiResponse> getWalletByUserId(@PathVariable Long userId) {
		try {
			// Authorization check: User can only view their own wallet or if they're admin
			Long currentUserId = getCurrentUserId();
			boolean isOwner = currentUserId.equals(userId);
			boolean isAdmin = isCurrentUserAdmin();

			if (!isOwner && !isAdmin) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(new ApiResponse(false, "Access denied: You can only view your own wallet", null));
			}

			UserWalletResponse wallet = walletService.getWalletByUserId(userId);
			return ResponseEntity.ok(new ApiResponse(true, "Wallet fetched successfully", wallet));
		} catch (Exception e) {
			log.error("Error fetching wallet: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/my-wallet")
	public ResponseEntity<ApiResponse> getMyWallet() {
		try {
			Long userId = getCurrentUserId();
			UserWalletResponse wallet = walletService.getWalletByUserId(userId);
			return ResponseEntity.ok(new ApiResponse(true, "Wallet fetched successfully", wallet));
		} catch (Exception e) {
			log.error("Error fetching wallet: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PostMapping("/credit")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> creditWallet(
		@RequestParam Long userId,
		@RequestParam BigDecimal amount,
		@RequestParam String description,
		@RequestParam(required = false) Long referenceId,
		@RequestParam(required = false) String referenceType
	) {
		try {
			log.info("Crediting wallet for user: {}, amount: {}", userId, amount);
			WalletTransactionResponse transaction = walletService.credit(
				userId, amount, description, referenceId, referenceType
			);
			return ResponseEntity.ok(new ApiResponse(true, "Wallet credited successfully", transaction));
		} catch (Exception e) {
			log.error("Error crediting wallet: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@PostMapping("/debit")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> debitWallet(
		@RequestParam Long userId,
		@RequestParam BigDecimal amount,
		@RequestParam String description,
		@RequestParam(required = false) Long referenceId,
		@RequestParam(required = false) String referenceType
	) {
		try {
			log.info("Debiting wallet for user: {}, amount: {}", userId, amount);
			WalletTransactionResponse transaction = walletService.debit(
				userId, amount, description, referenceId, referenceType
			);
			return ResponseEntity.ok(new ApiResponse(true, "Wallet debited successfully", transaction));
		} catch (Exception e) {
			log.error("Error debiting wallet: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/transactions")
	public ResponseEntity<ApiResponse> getTransactions() {
		try {
			Long userId = getCurrentUserId();
			log.info("Fetching transactions for user: {}", userId);
			List<WalletTransactionResponse> transactions = walletService.getTransactions(userId);
			return ResponseEntity.ok(new ApiResponse(true, "Transactions fetched successfully", transactions));
		} catch (Exception e) {
			log.error("Error fetching transactions: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/balance-history")
	public ResponseEntity<ApiResponse> getBalanceHistory(
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
	) {
		try {
			Long userId = getCurrentUserId();
			log.info("Fetching balance history for user: {}", userId);
			List<BalanceHistoryResponse> history = walletService.getBalanceHistory(userId, startDate, endDate);
			return ResponseEntity.ok(new ApiResponse(true, "Balance history fetched successfully", history));
		} catch (Exception e) {
			log.error("Error fetching balance history: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/balance")
	public ResponseEntity<ApiResponse> getBalance() {
		try {
			Long userId = getCurrentUserId();
			BigDecimal balance = walletService.getBalance(userId);
			return ResponseEntity.ok(new ApiResponse(true, "Balance fetched successfully", balance));
		} catch (Exception e) {
			log.error("Error fetching balance: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/total-credits")
	public ResponseEntity<ApiResponse> getTotalCredits() {
		try {
			Long userId = getCurrentUserId();
			BigDecimal totalCredits = walletService.getTotalCredits(userId);
			return ResponseEntity.ok(new ApiResponse(true, "Total credits fetched successfully", totalCredits));
		} catch (Exception e) {
			log.error("Error fetching total credits: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}

	@GetMapping("/total-debits")
	public ResponseEntity<ApiResponse> getTotalDebits() {
		try {
			Long userId = getCurrentUserId();
			BigDecimal totalDebits = walletService.getTotalDebits(userId);
			return ResponseEntity.ok(new ApiResponse(true, "Total debits fetched successfully", totalDebits));
		} catch (Exception e) {
			log.error("Error fetching total debits: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, e.getMessage(), null));
		}
	}
}
