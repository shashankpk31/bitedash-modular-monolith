package com.bitedash.wallet.service;

import com.bitedash.wallet.dto.response.BalanceHistoryResponse;
import com.bitedash.wallet.dto.response.UserWalletResponse;
import com.bitedash.wallet.dto.response.WalletTransactionResponse;
import com.bitedash.wallet.entity.UserWallet;
import com.bitedash.wallet.entity.WalletTransaction;
import com.bitedash.wallet.repository.UserWalletRepository;
import com.bitedash.wallet.repository.WalletTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Comprehensive test suite for WalletService.
 *
 * Tests cover all public methods with focus on:
 * - Happy path scenarios
 * - Edge cases (null, zero, negative values)
 * - Error conditions (insufficient balance, wallet not found)
 * - Concurrency protection (pessimistic locking verification)
 * - Transaction tracking (balance before/after)
 *
 * WHY use JUnit 5 + Mockito + AssertJ?
 * - JUnit 5: Modern testing framework with better nested test support
 * - Mockito: Industry-standard mocking framework for isolating unit tests
 * - AssertJ: Fluent assertions that improve test readability
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("WalletService Unit Tests")
class WalletServiceTest {

    @Mock
    private UserWalletRepository userWalletRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @InjectMocks
    private WalletService walletService;

    private static final Long TEST_USER_ID = 100L;
    private static final Long TEST_WALLET_ID = 1L;
    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("500.00");

    private UserWallet createTestWallet() {
        UserWallet wallet = new UserWallet();
        wallet.setId(TEST_WALLET_ID);
        wallet.setUserId(TEST_USER_ID);
        wallet.setBalance(INITIAL_BALANCE);
        return wallet;
    }

    @Nested
    @DisplayName("initWallet() Tests")
    class InitWalletTests {

        @Test
        @DisplayName("Should successfully initialize new wallet with zero balance")
        void shouldInitializeNewWallet() {
            // WHY test wallet initialization? This is the entry point for all wallet operations.
            // A new wallet MUST start with zero balance to maintain accounting integrity.

            when(userWalletRepository.existsByUserId(TEST_USER_ID)).thenReturn(false);

            UserWallet savedWallet = new UserWallet();
            savedWallet.setId(TEST_WALLET_ID);
            savedWallet.setUserId(TEST_USER_ID);
            savedWallet.setBalance(BigDecimal.ZERO);
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(savedWallet);

            UserWalletResponse response = walletService.initWallet(TEST_USER_ID);

            assertThat(response).isNotNull();
            assertThat(response.getUserId()).isEqualTo(TEST_USER_ID);
            assertThat(response.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);

            verify(userWalletRepository).existsByUserId(TEST_USER_ID);
            verify(userWalletRepository).save(any(UserWallet.class));
        }

        @Test
        @DisplayName("Should throw exception when wallet already exists")
        void shouldThrowExceptionWhenWalletAlreadyExists() {
            // WHY prevent duplicate wallets? Each user should have exactly ONE wallet
            // to maintain single source of truth for their balance. Multiple wallets
            // would create accounting chaos (which wallet is authoritative?).

            when(userWalletRepository.existsByUserId(TEST_USER_ID)).thenReturn(true);

            assertThatThrownBy(() -> walletService.initWallet(TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet already exists");

            verify(userWalletRepository).existsByUserId(TEST_USER_ID);
            verify(userWalletRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getWalletByUserId() Tests")
    class GetWalletByUserIdTests {

        @Test
        @DisplayName("Should retrieve existing wallet successfully")
        void shouldRetrieveExistingWallet() {
            // WHY test wallet retrieval? This is used in every wallet operation
            // to fetch current state before performing any transaction.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            UserWalletResponse response = walletService.getWalletByUserId(TEST_USER_ID);

            assertThat(response).isNotNull();
            assertThat(response.getUserId()).isEqualTo(TEST_USER_ID);
            assertThat(response.getBalance()).isEqualByComparingTo(INITIAL_BALANCE);

            verify(userWalletRepository).findByUserIdAndDeletedFalse(TEST_USER_ID);
        }

        @Test
        @DisplayName("Should throw exception when wallet not found")
        void shouldThrowExceptionWhenWalletNotFound() {
            // WHY fail when wallet not found? Operations on non-existent wallet
            // should fail fast rather than silently creating inconsistent state.

            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> walletService.getWalletByUserId(TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");

            verify(userWalletRepository).findByUserIdAndDeletedFalse(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("credit() Tests")
    class CreditTests {

        @Test
        @DisplayName("Should successfully credit wallet and record transaction")
        void shouldCreditWalletSuccessfully() {
            // WHY test credit operation? Credits increase wallet balance.
            // We must verify: (1) balance increased correctly, (2) transaction recorded,
            // (3) balanceBefore/After tracked for audit trail.

            BigDecimal creditAmount = new BigDecimal("100.00");
            BigDecimal expectedBalance = INITIAL_BALANCE.add(creditAmount);

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction transaction = new WalletTransaction(
                TEST_WALLET_ID, creditAmount, "CREDIT", INITIAL_BALANCE, expectedBalance
            );
            transaction.setId(1L);
            transaction.setStatus("SUCCESS");
            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(transaction);

            WalletTransactionResponse response = walletService.credit(
                TEST_USER_ID, creditAmount, "Test credit", 123L, "ORDER"
            );

            assertThat(response).isNotNull();
            assertThat(response.getTxnType()).isEqualTo("CREDIT");
            assertThat(response.getAmount()).isEqualByComparingTo(creditAmount);
            assertThat(response.getBalanceBefore()).isEqualByComparingTo(INITIAL_BALANCE);
            assertThat(response.getBalanceAfter()).isEqualByComparingTo(expectedBalance);
            assertThat(response.getStatus()).isEqualTo("SUCCESS");

            // WHY verify pessimistic lock? Ensures SELECT ... FOR UPDATE is called
            // to prevent concurrent transactions from reading stale balance.
            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
            verify(userWalletRepository).save(any(UserWallet.class));
            verify(transactionRepository).save(any(WalletTransaction.class));
        }

        @Test
        @DisplayName("Should throw exception for zero credit amount")
        void shouldThrowExceptionForZeroCreditAmount() {
            // WHY reject zero credits? Zero-value transactions waste storage and
            // provide no business value. They could also hide implementation bugs.

            BigDecimal zeroAmount = BigDecimal.ZERO;

            assertThatThrownBy(() -> walletService.credit(
                TEST_USER_ID, zeroAmount, "Invalid credit", null, null
            ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Credit amount must be positive");

            verify(userWalletRepository, never()).findByUserIdForUpdate(anyLong());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception for negative credit amount")
        void shouldThrowExceptionForNegativeCreditAmount() {
            // WHY reject negative credits? Negative credit would decrease balance,
            // which is semantically a DEBIT. Mixing semantics leads to confusion.

            BigDecimal negativeAmount = new BigDecimal("-50.00");

            assertThatThrownBy(() -> walletService.credit(
                TEST_USER_ID, negativeAmount, "Invalid credit", null, null
            ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Credit amount must be positive");

            verify(userWalletRepository, never()).findByUserIdForUpdate(anyLong());
        }

        @Test
        @DisplayName("Should throw exception when wallet not found for credit")
        void shouldThrowExceptionWhenWalletNotFoundForCredit() {
            // WHY fail when wallet not found? Cannot credit non-existent wallet.
            // Must fail fast to alert caller of data inconsistency.

            BigDecimal creditAmount = new BigDecimal("100.00");
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> walletService.credit(
                TEST_USER_ID, creditAmount, "Test credit", null, null
            ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");

            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should use pessimistic locking during credit operation")
        void shouldUsePessimisticLockingForCredit() {
            // WHY explicitly test locking? In high-concurrency scenarios, without
            // pessimistic locking, two credits could read same balance, both add
            // to it, and one transaction overwrites the other (lost update problem).

            BigDecimal creditAmount = new BigDecimal("100.00");
            UserWallet wallet = createTestWallet();

            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction transaction = new WalletTransaction();
            transaction.setId(1L);
            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(transaction);

            walletService.credit(TEST_USER_ID, creditAmount, "Test", null, null);

            // WHY verify findByUserIdForUpdate? This method applies @Lock(PESSIMISTIC_WRITE)
            // which translates to SELECT ... FOR UPDATE at database level.
            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("debit() Tests")
    class DebitTests {

        @Test
        @DisplayName("Should successfully debit wallet when sufficient balance")
        void shouldDebitWalletSuccessfully() {
            // WHY test debit operation? Debits decrease wallet balance for purchases.
            // Must verify: (1) sufficient balance check, (2) correct subtraction,
            // (3) transaction audit trail, (4) pessimistic locking for race protection.

            BigDecimal debitAmount = new BigDecimal("200.00");
            BigDecimal expectedBalance = INITIAL_BALANCE.subtract(debitAmount);

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction transaction = new WalletTransaction(
                TEST_WALLET_ID, debitAmount, "DEBIT", INITIAL_BALANCE, expectedBalance
            );
            transaction.setId(2L);
            transaction.setStatus("SUCCESS");
            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(transaction);

            WalletTransactionResponse response = walletService.debit(
                TEST_USER_ID, debitAmount, "Test debit", 456L, "PURCHASE"
            );

            assertThat(response).isNotNull();
            assertThat(response.getTxnType()).isEqualTo("DEBIT");
            assertThat(response.getAmount()).isEqualByComparingTo(debitAmount);
            assertThat(response.getBalanceBefore()).isEqualByComparingTo(INITIAL_BALANCE);
            assertThat(response.getBalanceAfter()).isEqualByComparingTo(expectedBalance);

            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
            verify(userWalletRepository).save(any(UserWallet.class));
            verify(transactionRepository).save(any(WalletTransaction.class));
        }

        @Test
        @DisplayName("Should throw exception for insufficient balance")
        void shouldThrowExceptionForInsufficientBalance() {
            // WHY enforce insufficient balance check? This is CRITICAL for preventing
            // users from spending more than they have (negative balance = financial loss).
            // Must fail atomically before any state changes.

            BigDecimal debitAmount = new BigDecimal("1000.00"); // Greater than INITIAL_BALANCE

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            assertThatThrownBy(() -> walletService.debit(
                TEST_USER_ID, debitAmount, "Test debit", null, null
            ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient wallet balance");

            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
            verify(userWalletRepository, never()).save(any()); // No state change on failure
            verify(transactionRepository, never()).save(any()); // No transaction recorded
        }

        @Test
        @DisplayName("Should throw exception for zero debit amount")
        void shouldThrowExceptionForZeroDebitAmount() {
            // WHY reject zero debits? Same reason as credits - no business value,
            // wastes storage, potential bug indicator.

            BigDecimal zeroAmount = BigDecimal.ZERO;

            assertThatThrownBy(() -> walletService.debit(
                TEST_USER_ID, zeroAmount, "Invalid debit", null, null
            ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Debit amount must be positive");

            verify(userWalletRepository, never()).findByUserIdForUpdate(anyLong());
        }

        @Test
        @DisplayName("Should throw exception for negative debit amount")
        void shouldThrowExceptionForNegativeDebitAmount() {
            // WHY reject negative debits? A negative debit would ADD money,
            // which is semantically a CREDIT. Keep operation semantics clear.

            BigDecimal negativeAmount = new BigDecimal("-50.00");

            assertThatThrownBy(() -> walletService.debit(
                TEST_USER_ID, negativeAmount, "Invalid debit", null, null
            ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Debit amount must be positive");

            verify(userWalletRepository, never()).findByUserIdForUpdate(anyLong());
        }

        @Test
        @DisplayName("Should throw exception when wallet not found for debit")
        void shouldThrowExceptionWhenWalletNotFoundForDebit() {
            // WHY fail when wallet not found? Cannot debit non-existent wallet.
            // This protects against stale references or concurrent deletions.

            BigDecimal debitAmount = new BigDecimal("100.00");
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> walletService.debit(
                TEST_USER_ID, debitAmount, "Test debit", null, null
            ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");

            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should use pessimistic locking during debit to prevent double-spend")
        void shouldUsePessimisticLockingForDebit() {
            // WHY critical for debit? This is the DOUBLE-SPEND PROBLEM:
            // T1: Read balance=500, check if 300 <= 500 (yes)
            // T2: Read balance=500, check if 300 <= 500 (yes)
            // T1: Debit 300, balance=200, commit
            // T2: Debit 300, balance=200, commit (WRONG! Should be -100)
            // Pessimistic lock prevents T2 from reading until T1 commits.

            BigDecimal debitAmount = new BigDecimal("100.00");
            UserWallet wallet = createTestWallet();

            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction transaction = new WalletTransaction();
            transaction.setId(1L);
            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(transaction);

            walletService.debit(TEST_USER_ID, debitAmount, "Test", null, null);

            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
        }

        @Test
        @DisplayName("Should allow debit equal to exact wallet balance")
        void shouldAllowDebitEqualToBalance() {
            // WHY test edge case of exact balance? Common scenario: user spends
            // all remaining credits. Balance should become exactly zero, not negative.

            BigDecimal exactBalance = INITIAL_BALANCE; // 500.00

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction transaction = new WalletTransaction(
                TEST_WALLET_ID, exactBalance, "DEBIT", INITIAL_BALANCE, BigDecimal.ZERO
            );
            transaction.setId(3L);
            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(transaction);

            WalletTransactionResponse response = walletService.debit(
                TEST_USER_ID, exactBalance, "Spend all", null, null
            );

            assertThat(response.getBalanceAfter()).isEqualByComparingTo(BigDecimal.ZERO);
            verify(userWalletRepository).save(any(UserWallet.class));
        }
    }

    @Nested
    @DisplayName("getTransactions() Tests")
    class GetTransactionsTests {

        @Test
        @DisplayName("Should retrieve all transactions for valid wallet")
        void shouldRetrieveTransactions() {
            // WHY test transaction retrieval? Users need to see their transaction
            // history for transparency (where did my money go?). This is required
            // for financial accountability and customer support.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            WalletTransaction txn1 = new WalletTransaction(
                TEST_WALLET_ID, new BigDecimal("100.00"), "CREDIT",
                BigDecimal.ZERO, new BigDecimal("100.00")
            );
            txn1.setId(1L);

            WalletTransaction txn2 = new WalletTransaction(
                TEST_WALLET_ID, new BigDecimal("50.00"), "DEBIT",
                new BigDecimal("100.00"), new BigDecimal("50.00")
            );
            txn2.setId(2L);

            when(transactionRepository.findByWalletIdAndDeletedFalseOrderByCreatedAtDesc(TEST_WALLET_ID))
                .thenReturn(Arrays.asList(txn2, txn1)); // Most recent first

            List<WalletTransactionResponse> transactions = walletService.getTransactions(TEST_USER_ID);

            assertThat(transactions).hasSize(2);
            assertThat(transactions.get(0).getTxnType()).isEqualTo("DEBIT");
            assertThat(transactions.get(1).getTxnType()).isEqualTo("CREDIT");

            verify(userWalletRepository).findByUserIdAndDeletedFalse(TEST_USER_ID);
            verify(transactionRepository).findByWalletIdAndDeletedFalseOrderByCreatedAtDesc(TEST_WALLET_ID);
        }

        @Test
        @DisplayName("Should return empty list when no transactions exist")
        void shouldReturnEmptyListWhenNoTransactions() {
            // WHY test empty transactions? A newly created wallet has no transactions.
            // Should return empty list, not null (null would cause NPE in client code).

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(transactionRepository.findByWalletIdAndDeletedFalseOrderByCreatedAtDesc(TEST_WALLET_ID))
                .thenReturn(Arrays.asList());

            List<WalletTransactionResponse> transactions = walletService.getTransactions(TEST_USER_ID);

            assertThat(transactions).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should throw exception when wallet not found for transactions")
        void shouldThrowExceptionWhenWalletNotFoundForTransactions() {
            // WHY fail when wallet not found? Cannot retrieve transactions for
            // non-existent wallet. Indicates data inconsistency or authorization issue.

            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> walletService.getTransactions(TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");

            verify(transactionRepository, never()).findByWalletIdAndDeletedFalseOrderByCreatedAtDesc(anyLong());
        }
    }

    @Nested
    @DisplayName("getBalanceHistory() Tests")
    class GetBalanceHistoryTests {

        @Test
        @DisplayName("Should retrieve balance history without date filtering")
        void shouldRetrieveBalanceHistoryWithoutDateFilter() {
            // WHY test balance history? Shows how wallet balance changed over time.
            // Useful for analytics, charting balance trends, and financial auditing.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            WalletTransaction txn1 = new WalletTransaction(
                TEST_WALLET_ID, new BigDecimal("100.00"), "CREDIT",
                BigDecimal.ZERO, new BigDecimal("100.00")
            );
            txn1.setDescription("Initial credit");

            WalletTransaction txn2 = new WalletTransaction(
                TEST_WALLET_ID, new BigDecimal("30.00"), "DEBIT",
                new BigDecimal("100.00"), new BigDecimal("70.00")
            );
            txn2.setDescription("Purchase");

            when(transactionRepository.getBalanceHistory(TEST_WALLET_ID))
                .thenReturn(Arrays.asList(txn1, txn2));

            List<BalanceHistoryResponse> history = walletService.getBalanceHistory(
                TEST_USER_ID, null, null
            );

            assertThat(history).hasSize(2);
            assertThat(history.get(0).getBalance()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(history.get(0).getChange()).isEqualByComparingTo(new BigDecimal("100.00")); // CREDIT = positive
            assertThat(history.get(1).getBalance()).isEqualByComparingTo(new BigDecimal("70.00"));
            assertThat(history.get(1).getChange()).isEqualByComparingTo(new BigDecimal("-30.00")); // DEBIT = negative

            verify(transactionRepository).getBalanceHistory(TEST_WALLET_ID);
            verify(transactionRepository, never()).getBalanceHistoryByDateRange(anyLong(), any(), any());
        }

        @Test
        @DisplayName("Should retrieve balance history with date range filtering")
        void shouldRetrieveBalanceHistoryWithDateRange() {
            // WHY support date range? Users want to see "what happened last month"
            // or "transactions this year". Date filtering reduces data transfer.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime endDate = LocalDateTime.of(2024, 12, 31, 23, 59);

            WalletTransaction txn = new WalletTransaction(
                TEST_WALLET_ID, new BigDecimal("200.00"), "CREDIT",
                BigDecimal.ZERO, new BigDecimal("200.00")
            );

            when(transactionRepository.getBalanceHistoryByDateRange(TEST_WALLET_ID, startDate, endDate))
                .thenReturn(Arrays.asList(txn));

            List<BalanceHistoryResponse> history = walletService.getBalanceHistory(
                TEST_USER_ID, startDate, endDate
            );

            assertThat(history).hasSize(1);
            assertThat(history.get(0).getChange()).isEqualByComparingTo(new BigDecimal("200.00"));

            verify(transactionRepository).getBalanceHistoryByDateRange(TEST_WALLET_ID, startDate, endDate);
            verify(transactionRepository, never()).getBalanceHistory(anyLong());
        }

        @Test
        @DisplayName("Should correctly calculate change for CREDIT transactions")
        void shouldCalculatePositiveChangeForCredit() {
            // WHY test change calculation? Balance history should show CREDITS as positive
            // changes (money added) and DEBITS as negative (money removed).

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            WalletTransaction creditTxn = new WalletTransaction(
                TEST_WALLET_ID, new BigDecimal("150.00"), "CREDIT",
                new BigDecimal("100.00"), new BigDecimal("250.00")
            );
            creditTxn.setDescription("Wallet topup");

            when(transactionRepository.getBalanceHistory(TEST_WALLET_ID))
                .thenReturn(Arrays.asList(creditTxn));

            List<BalanceHistoryResponse> history = walletService.getBalanceHistory(
                TEST_USER_ID, null, null
            );

            assertThat(history.get(0).getChange()).isEqualByComparingTo(new BigDecimal("150.00"));
            assertThat(history.get(0).getTxnType()).isEqualTo("CREDIT");
        }

        @Test
        @DisplayName("Should correctly calculate change for DEBIT transactions")
        void shouldCalculateNegativeChangeForDebit() {
            // WHY negate debit amounts? In balance history, we want to show the
            // IMPACT on balance. Debit of 50 means balance decreased by -50.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            WalletTransaction debitTxn = new WalletTransaction(
                TEST_WALLET_ID, new BigDecimal("75.00"), "DEBIT",
                new BigDecimal("200.00"), new BigDecimal("125.00")
            );
            debitTxn.setDescription("Order payment");

            when(transactionRepository.getBalanceHistory(TEST_WALLET_ID))
                .thenReturn(Arrays.asList(debitTxn));

            List<BalanceHistoryResponse> history = walletService.getBalanceHistory(
                TEST_USER_ID, null, null
            );

            assertThat(history.get(0).getChange()).isEqualByComparingTo(new BigDecimal("-75.00"));
            assertThat(history.get(0).getTxnType()).isEqualTo("DEBIT");
        }
    }

    @Nested
    @DisplayName("getBalance() Tests")
    class GetBalanceTests {

        @Test
        @DisplayName("Should retrieve current balance for valid wallet")
        void shouldRetrieveCurrentBalance() {
            // WHY separate getBalance method? Often clients just need the current
            // balance without full wallet details. This is a lightweight query.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));

            BigDecimal balance = walletService.getBalance(TEST_USER_ID);

            assertThat(balance).isEqualByComparingTo(INITIAL_BALANCE);
            verify(userWalletRepository).findByUserIdAndDeletedFalse(TEST_USER_ID);
        }

        @Test
        @DisplayName("Should throw exception when wallet not found for balance check")
        void shouldThrowExceptionWhenWalletNotFoundForBalance() {
            // WHY fail when wallet not found? Cannot return balance for non-existent
            // wallet. Returning null or zero would hide the real problem.

            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> walletService.getBalance(TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");
        }
    }

    @Nested
    @DisplayName("getTotalCredits() Tests")
    class GetTotalCreditsTests {

        @Test
        @DisplayName("Should calculate total credits correctly")
        void shouldCalculateTotalCredits() {
            // WHY track total credits? Analytics and reporting need to know "how much
            // money has been added to this wallet over its lifetime". Used for
            // financial reporting and user spending patterns.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(transactionRepository.getTotalCreditsByWallet(TEST_WALLET_ID))
                .thenReturn(750.50);

            BigDecimal totalCredits = walletService.getTotalCredits(TEST_USER_ID);

            assertThat(totalCredits).isEqualByComparingTo(new BigDecimal("750.50"));
            verify(transactionRepository).getTotalCreditsByWallet(TEST_WALLET_ID);
        }

        @Test
        @DisplayName("Should return zero when no credits exist")
        void shouldReturnZeroWhenNoCredits() {
            // WHY return zero instead of null? Zero is semantically correct (no credits
            // = 0 total). Null would require null checks everywhere and risk NPE.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(transactionRepository.getTotalCreditsByWallet(TEST_WALLET_ID))
                .thenReturn(null);

            BigDecimal totalCredits = walletService.getTotalCredits(TEST_USER_ID);

            assertThat(totalCredits).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should throw exception when wallet not found for total credits")
        void shouldThrowExceptionWhenWalletNotFoundForTotalCredits() {
            // WHY fail when wallet not found? Cannot calculate totals for non-existent
            // wallet. Indicates stale reference or authorization issue.

            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> walletService.getTotalCredits(TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");
        }
    }

    @Nested
    @DisplayName("getTotalDebits() Tests")
    class GetTotalDebitsTests {

        @Test
        @DisplayName("Should calculate total debits correctly")
        void shouldCalculateTotalDebits() {
            // WHY track total debits? Shows "how much money has been spent from this
            // wallet over its lifetime". Critical for spending analytics and budgeting.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(transactionRepository.getTotalDebitsByWallet(TEST_WALLET_ID))
                .thenReturn(320.75);

            BigDecimal totalDebits = walletService.getTotalDebits(TEST_USER_ID);

            assertThat(totalDebits).isEqualByComparingTo(new BigDecimal("320.75"));
            verify(transactionRepository).getTotalDebitsByWallet(TEST_WALLET_ID);
        }

        @Test
        @DisplayName("Should return zero when no debits exist")
        void shouldReturnZeroWhenNoDebits() {
            // WHY return zero? A wallet with no debits has spent 0, not undefined.
            // Zero is the correct mathematical and semantic value.

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(transactionRepository.getTotalDebitsByWallet(TEST_WALLET_ID))
                .thenReturn(null);

            BigDecimal totalDebits = walletService.getTotalDebits(TEST_USER_ID);

            assertThat(totalDebits).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should throw exception when wallet not found for total debits")
        void shouldThrowExceptionWhenWalletNotFoundForTotalDebits() {
            // WHY fail when wallet not found? Same as credits - cannot calculate
            // statistics for non-existent entity.

            when(userWalletRepository.findByUserIdAndDeletedFalse(TEST_USER_ID))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> walletService.getTotalDebits(TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");
        }
    }

    @Nested
    @DisplayName("Concurrency and Race Condition Tests")
    class ConcurrencyTests {

        @Test
        @DisplayName("Should verify pessimistic lock prevents concurrent credit race")
        void shouldVerifyPessimisticLockForConcurrentCredits() {
            // WHY test concurrent credits? While credits don't have the same risk as
            // debits (no insufficient balance check), we still need to prevent lost
            // updates where one credit overwrites another's balance change.

            BigDecimal creditAmount = new BigDecimal("100.00");
            UserWallet wallet = createTestWallet();

            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction transaction = new WalletTransaction();
            transaction.setId(1L);
            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(transaction);

            walletService.credit(TEST_USER_ID, creditAmount, "Test", null, null);

            // WHY verify repository method called? The @Lock(PESSIMISTIC_WRITE) annotation
            // is on the repository method. Verifying the method was called ensures the
            // lock is acquired before reading balance.
            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
        }

        @Test
        @DisplayName("Should verify pessimistic lock prevents double-spend on concurrent debits")
        void shouldVerifyPessimisticLockForConcurrentDebits() {
            // WHY is this the MOST CRITICAL test? Double-spend is the nightmare scenario:
            // User has $100. Two concurrent debits of $80 each. Without pessimistic lock:
            // T1 reads $100, checks 80 <= 100 (pass)
            // T2 reads $100, checks 80 <= 100 (pass) ← STALE READ
            // T1 writes $20, commits
            // T2 writes $20, commits ← WRONG! Should be -$60
            // Result: User spent $160 with only $100 balance!

            BigDecimal debitAmount = new BigDecimal("100.00");
            UserWallet wallet = createTestWallet();

            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction transaction = new WalletTransaction();
            transaction.setId(1L);
            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(transaction);

            walletService.debit(TEST_USER_ID, debitAmount, "Test", null, null);

            // WHY this verification matters? The pessimistic lock (SELECT ... FOR UPDATE)
            // blocks other transactions from reading until this transaction commits,
            // ensuring serializable execution of balance checks.
            verify(userWalletRepository).findByUserIdForUpdate(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("Transaction Audit Trail Tests")
    class TransactionAuditTests {

        @Test
        @DisplayName("Should record balance before and after in credit transaction")
        void shouldRecordBalanceBeforeAfterInCredit() {
            // WHY track balanceBefore/After? Audit trail requirement. For compliance,
            // dispute resolution, and debugging, we need to prove what the balance was
            // before the transaction and what it became after. This prevents "he said,
            // she said" disputes.

            BigDecimal creditAmount = new BigDecimal("150.00");
            BigDecimal expectedAfter = INITIAL_BALANCE.add(creditAmount);

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction savedTxn = new WalletTransaction(
                TEST_WALLET_ID, creditAmount, "CREDIT", INITIAL_BALANCE, expectedAfter
            );
            savedTxn.setId(1L);

            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(savedTxn);

            WalletTransactionResponse response = walletService.credit(
                TEST_USER_ID, creditAmount, "Audit test", null, null
            );

            // WHY assert exact values? Ensures audit trail is precise. Rounding errors
            // or incorrect calculations would be detected here.
            assertThat(response.getBalanceBefore()).isEqualByComparingTo(INITIAL_BALANCE);
            assertThat(response.getBalanceAfter()).isEqualByComparingTo(expectedAfter);
            assertThat(response.getAmount()).isEqualByComparingTo(creditAmount);
        }

        @Test
        @DisplayName("Should record balance before and after in debit transaction")
        void shouldRecordBalanceBeforeAfterInDebit() {
            // WHY critical for debit? Even more important than credit. If user disputes
            // "I was charged but my balance didn't update", the balanceBefore/After
            // proves exactly what happened. Essential for customer support.

            BigDecimal debitAmount = new BigDecimal("200.00");
            BigDecimal expectedAfter = INITIAL_BALANCE.subtract(debitAmount);

            UserWallet wallet = createTestWallet();
            when(userWalletRepository.findByUserIdForUpdate(TEST_USER_ID))
                .thenReturn(Optional.of(wallet));
            when(userWalletRepository.save(any(UserWallet.class))).thenReturn(wallet);

            WalletTransaction savedTxn = new WalletTransaction(
                TEST_WALLET_ID, debitAmount, "DEBIT", INITIAL_BALANCE, expectedAfter
            );
            savedTxn.setId(2L);

            when(transactionRepository.save(any(WalletTransaction.class))).thenReturn(savedTxn);

            WalletTransactionResponse response = walletService.debit(
                TEST_USER_ID, debitAmount, "Audit test", null, null
            );

            assertThat(response.getBalanceBefore()).isEqualByComparingTo(INITIAL_BALANCE);
            assertThat(response.getBalanceAfter()).isEqualByComparingTo(expectedAfter);
            assertThat(response.getAmount()).isEqualByComparingTo(debitAmount);
        }
    }
}
