package com.bitedash.notification.dto;

import java.io.Serializable;

/**
 * Notification payload for email/SMS sending
 */
public record NotificationPayload(
    String to,
    String message,
    String type
) implements Serializable {}
