# Payment Module

## Overview
The Payment Module manages platform revenue tracking, commission logging, and payment transactions for the BiteDash platform.

## Migration Summary

### Source
- `backend/payment-service/`

### Target
- `bitedash-modular-backend/payment-module/`

### Changes Made
1. **Package Rename**: `com.hungerbox.payment_service` → `com.bitedash.payment`
2. **Schema Added**: All entities use `schema = "payment_schema"`
3. **Shared Module Integration**: Uses shared classes:
   - `com.bitedash.shared.entity.BaseEntity`
   - `com.bitedash.shared.dto.ApiResponse`
   - `com.bitedash.shared.util.UserContext`
   - `com.bitedash.shared.enums.Role`
   - `com.bitedash.shared.annotation.RequireRole`

### Migrated Components

#### Entities (4)
- `Transaction` - Payment transactions (Razorpay integration)
- `PlatformWallet` - Single platform wallet (ID = 1)
- `PlatformRevenueLog` - Revenue tracking by type
- `AuditLog` - Audit trail for payment operations

#### DTOs (4)
- `CommissionLogRequest` - Commission logging request
- `PlatformWalletResponse` - Platform wallet details
- `PlatformRevenueStatsResponse` - Revenue statistics
- `DailyRevenueResponse` - Daily revenue breakdown

#### Repositories (4)
- `TransactionRepository` - Transaction CRUD with Razorpay queries
- `PlatformWalletRepository` - Singleton wallet management
- `PlatformRevenueLogRepository` - Complex revenue analytics queries
- `AuditLogRepository` - Audit log operations

#### Services (1)
- `PlatformRevenueService` - Revenue tracking, commission logging, analytics

#### Controllers (1)
- `RevenueController` - Revenue management endpoints (Super Admin only)

#### Public API
- `PaymentPublicService` - Public interface for other modules
- `PaymentPublicServiceImpl` - Implementation for commission logging

## Public API Usage

Other modules can inject and use the Payment Public Service:

```java
@Autowired
private PaymentPublicService paymentPublicService;

// Log commission from an order
CommissionLogRequest request = new CommissionLogRequest(
    orderId, commissionAmount, vendorId, orgId
);
paymentPublicService.logCommission(request);

// Get overall revenue stats
PlatformRevenueStatsResponse stats = paymentPublicService.getRevenueStats();
```

## Key Features

### Revenue Types
- **COMMISSION** - Commission from vendor orders
- **GATEWAY_MARKUP** - Payment gateway fees
- **PROMOTION_REVENUE** - Vendor promotion purchases
- **SUBSCRIPTION_FEE** - Organization subscription fees

### Platform Wallet
- Singleton wallet (ID = 1) tracks all platform revenue
- Auto-creates if not exists
- Tracks total commission, gateway markup, promotion spend

### Business Logic
- Atomic transaction logging with wallet updates
- Revenue analytics by type, vendor, organization
- Daily revenue summaries
- Date range filtering for all statistics

### Endpoints

#### Public Endpoints (Internal)
- `POST /revenue/log-commission` - Log commission (called by order-module)

#### Super Admin Endpoints
- `GET /revenue/platform/stats` - Platform revenue statistics
- `GET /revenue/platform/daily` - Daily revenue breakdown
- `GET /revenue/platform/wallet` - Platform wallet details
- `GET /revenue/vendor/{vendorId}` - Revenue by vendor
- `GET /revenue/organization/{orgId}` - Revenue by organization

## Database Schema

### Tables
- `payment_schema.payments` - Payment transactions
- `payment_schema.platform_wallet` - Platform wallet (singleton)
- `payment_schema.platform_revenue_log` - Revenue tracking log
- `payment_schema.audit_log` - Audit trail

## Dependencies
- shared-module (for BaseEntity, ApiResponse, UserContext, RequireRole)
- Spring Data JPA
- PostgreSQL

## Notes
- Transaction entity inherits from `BaseEntity` (soft delete support)
- PlatformWallet does NOT inherit BaseEntity (singleton pattern)
- Uses `@Transactional` for atomic revenue logging + wallet updates
- All revenue queries use aggregate functions (SUM, COUNT, GROUP BY)
- Super Admin role required for all analytics endpoints
