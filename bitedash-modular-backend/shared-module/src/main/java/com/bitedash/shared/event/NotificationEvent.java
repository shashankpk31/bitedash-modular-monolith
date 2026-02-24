package com.bitedash.shared.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event for triggering notifications (Email/SMS)
 * Published by any module that needs to send notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String to;
    private String message;
    private String type; // "EMAIL" or "SMS"
}
