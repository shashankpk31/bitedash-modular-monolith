package com.bitedash.order.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Publisher for real-time order updates via WebSocket.
 * Sends notifications to vendors and employees when order status changes.
 */
@Component
public class OrderUpdatePublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderUpdatePublisher.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Publishes order update to relevant subscribers.
     * Sends to vendor topic and user-specific queue.
     *
     * @param orderId Order ID
     * @param status Order status
     * @param vendorId Vendor ID
     * @param userId User ID
     */
    public void publishOrderUpdate(Long orderId, String status, Long vendorId, Long userId) {
        if (orderId == null) {
            log.warn("Attempted to publish order update with null orderId");
            return;
        }

        try {
            // Create notification payload
            Map<String, Object> notification = new HashMap<>();
            notification.put("orderId", orderId);
            notification.put("status", status);
            notification.put("vendorId", vendorId);
            notification.put("userId", userId);
            notification.put("timestamp", LocalDateTime.now().toString());
            notification.put("message", getNotificationMessage(status));

            // Send to vendor topic (all vendor instances can receive)
            if (vendorId != null) {
                String vendorTopic = "/topic/orders/vendor/" + vendorId;
                messagingTemplate.convertAndSend(vendorTopic, notification);
                log.info("Published order update to vendor topic: {}, orderId: {}", vendorTopic, orderId);
            }

            // Send to user-specific queue (only the specific user receives)
            if (userId != null) {
                String userQueue = "/queue/orders/user/" + userId;
                messagingTemplate.convertAndSend(userQueue, notification);
                log.info("Published order update to user queue: {}, orderId: {}", userQueue, orderId);
            }

        } catch (Exception e) {
            log.error("Failed to publish order update for orderId: {}, error: {}",
                     orderId, e.getMessage(), e);
        }
    }

    /**
     * Publishes notification when a new order is created.
     *
     * @param orderId Order ID
     * @param orderNumber Order number
     * @param status Order status
     * @param totalAmount Total amount
     * @param vendorId Vendor ID
     * @param userId User ID
     */
    public void publishNewOrder(Long orderId, String orderNumber, String status,
                                Object totalAmount, Long vendorId, Long userId) {
        if (orderId == null) {
            log.warn("Attempted to publish null new order");
            return;
        }

        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "NEW_ORDER");
            notification.put("orderId", orderId);
            notification.put("orderNumber", orderNumber);
            notification.put("status", status);
            notification.put("totalAmount", totalAmount);
            notification.put("vendorId", vendorId);
            notification.put("userId", userId);
            notification.put("timestamp", LocalDateTime.now().toString());
            notification.put("message", "New order received!");

            // Send to vendor topic
            if (vendorId != null) {
                String vendorTopic = "/topic/orders/vendor/" + vendorId;
                messagingTemplate.convertAndSend(vendorTopic, notification);
                log.info("Published NEW order notification to vendor: {}, orderId: {}",
                        vendorId, orderId);
            }

        } catch (Exception e) {
            log.error("Failed to publish new order notification for orderId: {}, error: {}",
                     orderId, e.getMessage(), e);
        }
    }

    /**
     * Publishes status change notification.
     *
     * @param orderId Order ID
     * @param previousStatus Previous order status
     * @param newStatus New order status
     * @param vendorId Vendor ID
     * @param userId User ID
     */
    public void publishStatusChange(Long orderId, String previousStatus, String newStatus,
                                    Long vendorId, Long userId) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "STATUS_CHANGE");
            notification.put("orderId", orderId);
            notification.put("previousStatus", previousStatus);
            notification.put("newStatus", newStatus);
            notification.put("vendorId", vendorId);
            notification.put("userId", userId);
            notification.put("timestamp", LocalDateTime.now().toString());
            notification.put("message", getNotificationMessage(newStatus));

            // Send to vendor topic
            if (vendorId != null) {
                String vendorTopic = "/topic/orders/vendor/" + vendorId;
                messagingTemplate.convertAndSend(vendorTopic, notification);
            }

            // Send to user queue
            if (userId != null) {
                String userQueue = "/queue/orders/user/" + userId;
                messagingTemplate.convertAndSend(userQueue, notification);
            }

            log.info("Published status change: orderId={}, {} -> {}", orderId, previousStatus, newStatus);

        } catch (Exception e) {
            log.error("Failed to publish status change for orderId: {}, error: {}",
                     orderId, e.getMessage(), e);
        }
    }

    /**
     * Gets a user-friendly notification message based on order status.
     *
     * @param status Order status
     * @return User-friendly message
     */
    private String getNotificationMessage(String status) {
        if (status == null) {
            return "Order status updated.";
        }

        return switch (status) {
            case "PENDING" -> "Order placed successfully!";
            case "PREPARING" -> "Your order is being prepared!";
            case "READY" -> "Your order is ready for pickup!";
            case "DELIVERED" -> "Order delivered successfully!";
            case "CANCELLED" -> "Order has been cancelled.";
            default -> "Order status updated.";
        };
    }
}
