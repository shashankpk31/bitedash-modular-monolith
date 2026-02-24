# Order Module

## Overview
The Order Module manages food orders, order items, and order status tracking for the BiteDash platform.

## Migration Summary

### Source
- `backend/order-service/`

### Target
- `bitedash-modular-backend/order-module/`

### Changes Made
1. **Package Rename**: `com.hungerbox.order_service` → `com.bitedash.order`
2. **Schema Added**: All entities use `schema = "order_schema"`
3. **Shared Module Integration**: Uses shared classes from `com.bitedash.shared.*`
4. **Payment Client Removed**: TODO - will be replaced with direct service injection via PaymentPublicService
5. **RabbitMQ Replaced**: TODO - will use Spring Events (OrderPlacedEvent, OrderStatusChangedEvent)

### Migrated Components

#### Entities (4)
- `Order` - Main order entity with EntityGraphs for eager loading
- `OrderItem` - Order line items with JSONB customizations
- `OrderStatusHistory` - Order status change tracking
- `AuditLog` - Audit trail for order operations

#### DTOs (6)
- **Request**: OrderRequest, OrderItemRequest, RateOrderRequest
- **Response**: OrderResponse, OrderItemResponse, OrderStatusHistoryResponse

#### Repositories (4)
- `OrderRepository` - Order queries with EntityGraph support
- `OrderItemRepository` - Order item CRUD
- `OrderStatusHistoryRepository` - Status history queries
- `AuditLogRepository` - Audit log operations

#### Services (2)
- `OrderService` - Core order management (create, update, status changes)
- `QRCodeService` - QR code generation for order pickup

#### Controllers (1)
- `OrderController` - Full REST API for order operations

#### Public API
- `OrderPublicService` - Public interface for other modules
- `OrderPublicServiceImpl` - Implementation

## Key Features

### Order Statuses
- PENDING - Order placed, awaiting confirmation
- CONFIRMED - Vendor confirmed order
- PREPARING - Order being prepared
- READY - Order ready for pickup
- COMPLETED - Order delivered/picked up
- CANCELLED - Order cancelled

### Entity Relationships
- Order → OrderItem (OneToMany, cascade ALL)
- Order → OrderStatusHistory (OneToMany, cascade ALL)
- Uses @NamedEntityGraph for N+1 prevention

### Business Logic
- Order number generation (unique)
- QR code generation for pickup
- Commission calculation (15% default)
- Vendor payout calculation
- Pickup OTP generation
- Status history tracking

## Database Schema

### Tables
- `order_schema.orders` - Main orders
- `order_schema.order_items` - Order line items (JSONB customizations)
- `order_schema.order_status_history` - Status change log
- `order_schema.audit_log` - Audit trail

## TODO Items

1. **Replace Payment Feign Client**: Use `PaymentPublicService` for commission logging
2. **Replace RabbitMQ**: Implement Spring Events:
   - `OrderPlacedEvent` - When order is created
   - `OrderStatusChangedEvent` - When order status updates
3. **Add Event Listeners**: For cross-module communication

## Dependencies
- shared-module
- payment-module (for PaymentPublicService - TODO)
- Spring Data JPA
- PostgreSQL with JSONB support
- Hypersistence Utils (for JSONB mapping)

## Notes
- Uses @EntityGraph to prevent N+1 queries when loading orders with items
- OrderItem.customizations stored as JSONB for flexibility
- Commission rate configurable per order (defaults to 15%)
- QR code data generated for order verification
- Soft delete inherited from BaseEntity
