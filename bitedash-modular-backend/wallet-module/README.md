# Wallet Module

## Overview
The Wallet Module manages user wallets and transactions for the BiteDash platform.

## Migration Summary

### Source
- `backend/wallet-service/`

### Target
- `bitedash-modular-backend/wallet-module/`

### Changes Made
1. **Package Rename**: `com.hungerbox.wallet_service` → `com.bitedash.wallet`
2. **Schema Added**: All entities use `schema = "wallet_schema"`
3. **Shared Module Integration**: Uses shared classes:
   - `com.bitedash.shared.entity.BaseEntity`
   - `com.bitedash.shared.dto.ApiResponse`
   - `com.bitedash.shared.util.UserContext`
   - `com.bitedash.shared.enums.Role`
   - `com.bitedash.shared.annotation.RequireRole`

### Migrated Components

#### Entities (3)
- `UserWallet` - User wallet entity with balance
- `WalletTransaction` - Transaction history (credit/debit)
- `AuditLog` - Audit trail for wallet operations

#### DTOs (3)
- `UserWalletResponse` - Wallet details response
- `WalletTransactionResponse` - Transaction details response
- `BalanceHistoryResponse` - Balance history with changes

#### Repositories (3)
- `UserWalletRepository` - Wallet CRUD operations
- `WalletTransactionRepository` - Transaction queries with complex JPQL
- `AuditLogRepository` - Audit log operations

#### Services (1)
- `WalletService` - Core wallet operations (init, credit, debit, balance, history)

#### Controllers (2)
- `WalletController` - Legacy init endpoint
- `WalletControllerNew` - Full REST API for wallet operations

#### Public API
- `WalletPublicService` - Public interface for other modules
- `WalletPublicServiceImpl` - Implementation with error handling

## Public API Usage

Other modules can inject and use the Wallet Public Service:

```java
@Autowired
private WalletPublicService walletPublicService;

// Get wallet details
UserWalletResponse wallet = walletPublicService.getWalletByUserId(userId);

// Deduct balance (returns false if insufficient)
boolean success = walletPublicService.deductBalance(userId, amount);

// Add balance
walletPublicService.addBalance(userId, amount);

// Get current balance
BigDecimal balance = walletPublicService.getBalance(userId);
```

## Key Features

### Transaction Types
- **CREDIT** - Add money to wallet
- **DEBIT** - Deduct money from wallet

### Business Logic
- Balance validation before debit
- Atomic transaction recording (before/after balance)
- Transaction history with filtering
- Balance history tracking
- Total credits/debits calculation

### Endpoints

#### Public Endpoints
- `POST /wallet/init/{userId}` - Initialize wallet for user
- `GET /wallet/user/{userId}` - Get wallet by user ID
- `GET /wallet/my-wallet` - Get current user's wallet
- `POST /wallet/credit` - Credit wallet
- `POST /wallet/debit` - Debit wallet
- `GET /wallet/transactions` - Get transaction history
- `GET /wallet/balance-history` - Get balance history
- `GET /wallet/balance` - Get current balance
- `GET /wallet/total-credits` - Get total credits
- `GET /wallet/total-debits` - Get total debits

## Database Schema

### Tables
- `wallet_schema.user_wallets` - User wallet data
- `wallet_schema.wallet_transactions` - Transaction history
- `wallet_schema.audit_log` - Audit trail

## Dependencies
- shared-module (for BaseEntity, ApiResponse, UserContext)
- Spring Data JPA
- PostgreSQL

## Notes
- All entities inherit from `BaseEntity` (soft delete support)
- Uses `@Transactional` for atomic wallet operations
- Balance consistency maintained through before/after tracking
- Supports reference linking (referenceId, referenceType) for orders
