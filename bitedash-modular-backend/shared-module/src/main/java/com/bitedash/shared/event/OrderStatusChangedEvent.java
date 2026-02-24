package com.bitedash.shared.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when order status changes
 * Used to trigger order status update notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangedEvent {
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private String userName;
    private String oldStatus;
    private String newStatus;
}
