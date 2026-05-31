# WebSocket Integration Guide for OrderService

## Quick Reference - Add to OrderService

When you create `OrderService.java`, follow these steps:

---

## Step 1: Add Import

```java
import com.bitedash.order.websocket.OrderUpdatePublisher;
```

---

## Step 2: Autowire the Publisher

Add this field to your OrderService class:

```java
@Autowired
private OrderUpdatePublisher orderUpdatePublisher;
```

---

## Step 3: Publish Notifications in createOrder()

After saving the order, add this code:

```java
@Transactional
public OrderResponse createOrder(OrderRequest request) {
    // ... existing order creation logic ...

    Order savedOrder = orderRepository.save(order);

    // ✅ ADD THIS: Publish WebSocket notification
    orderUpdatePublisher.publishOrderUpdate(
        savedOrder.getId(),
        savedOrder.getStatus(),
        savedOrder.getVendorId(),
        savedOrder.getUserId()
    );

    return mapToResponse(savedOrder);
}
```

---

## Step 4: Publish Notifications in updateOrderStatus()

After updating the status, add this code:

```java
@Transactional
public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("Order not found"));

    String oldStatus = order.getStatus();
    order.setStatus(newStatus);
    Order updatedOrder = orderRepository.save(order);

    // ✅ ADD THIS: Publish WebSocket notification
    orderUpdatePublisher.publishOrderUpdate(
        orderId,
        newStatus,
        order.getVendorId(),
        order.getUserId()
    );

    return mapToResponse(updatedOrder);
}
```

---

## Complete Example: OrderService.java

```java
package com.bitedash.order.service;

import com.bitedash.order.entity.Order;
import com.bitedash.order.repository.OrderRepository;
import com.bitedash.order.websocket.OrderUpdatePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderUpdatePublisher orderUpdatePublisher; // ← ADD THIS

    @Transactional
    public Order createOrder(OrderRequest request) {
        // Create and save order
        Order order = new Order();
        // ... set order fields ...

        Order savedOrder = orderRepository.save(order);

        // ✅ Publish WebSocket notification
        orderUpdatePublisher.publishOrderUpdate(
            savedOrder.getId(),
            savedOrder.getStatus(),
            savedOrder.getVendorId(),
            savedOrder.getUserId()
        );

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        // ✅ Publish WebSocket notification
        orderUpdatePublisher.publishOrderUpdate(
            orderId,
            newStatus,
            order.getVendorId(),
            order.getUserId()
        );

        return updatedOrder;
    }
}
```

---

## Available Publisher Methods

The `OrderUpdatePublisher` has three methods:

### 1. publishOrderUpdate (Main method)
```java
orderUpdatePublisher.publishOrderUpdate(
    Long orderId,
    String status,
    Long vendorId,
    Long userId
);
```

### 2. publishNewOrder (For new order notifications)
```java
orderUpdatePublisher.publishNewOrder(
    Long orderId,
    String orderNumber,
    String status,
    Object totalAmount,
    Long vendorId,
    Long userId
);
```

### 3. publishStatusChange (For detailed status changes)
```java
orderUpdatePublisher.publishStatusChange(
    Long orderId,
    String previousStatus,
    String newStatus,
    Long vendorId,
    Long userId
);
```

---

## WebSocket Topics

Notifications are sent to:

- **Vendor Topic:** `/topic/orders/vendor/{vendorId}`
- **User Queue:** `/queue/orders/user/{userId}`

Frontend can subscribe to these endpoints to receive real-time updates.

---

## Testing WebSocket

### 1. Start the Application
```bash
mvn spring-boot:run
```

### 2. Connect to WebSocket
WebSocket endpoint: `http://localhost:8080/ws`

### 3. Subscribe to Topics
```javascript
// Vendor subscription
stompClient.subscribe('/topic/orders/vendor/123', (message) => {
    console.log('Vendor notification:', JSON.parse(message.body));
});

// User subscription
stompClient.subscribe('/queue/orders/user/456', (message) => {
    console.log('User notification:', JSON.parse(message.body));
});
```

### 4. Create or Update an Order
The WebSocket notification should be triggered automatically!

---

## Notification Payload Example

```json
{
  "orderId": 123,
  "status": "PREPARING",
  "vendorId": 5,
  "userId": 42,
  "timestamp": "2026-02-15T10:30:45.123",
  "message": "Your order is being prepared!"
}
```

---

## Status Messages

The publisher automatically generates user-friendly messages:

| Status      | Message                              |
|-------------|--------------------------------------|
| PENDING     | Order placed successfully!           |
| PREPARING   | Your order is being prepared!        |
| READY       | Your order is ready for pickup!      |
| DELIVERED   | Order delivered successfully!        |
| CANCELLED   | Order has been cancelled.            |
| Other       | Order status updated.                |

---

## Troubleshooting

### WebSocket not connecting?
- Check if `spring-boot-starter-websocket` is in `order-module/pom.xml`
- Verify WebSocketConfig is in `com.bitedash.order.config` package
- Ensure Spring Boot is scanning the package

### Notifications not sent?
- Check if OrderUpdatePublisher is autowired correctly
- Verify logs: Look for "Published order update to vendor topic"
- Ensure vendorId and userId are not null

### Frontend not receiving messages?
- Verify STOMP client is connected
- Check subscription topics match: `/topic/orders/vendor/{vendorId}`
- Enable STOMP debug logging on client side

---

## Configuration (Optional)

To customize WebSocket behavior, edit `WebSocketConfig.java`:

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("http://localhost:3000") // Restrict origins
            .withSockJS();
}
```

---

**Ready to integrate!** 🚀

Just add the 4 changes above when you create OrderService, and real-time order updates will work automatically.
