package com.bitedash.shared.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Event published when a new order is placed
 * Used to trigger order confirmation notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent {
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private String userName;
    private Long vendorId;
    private BigDecimal totalAmount;
    private String deliveryTime;
}
