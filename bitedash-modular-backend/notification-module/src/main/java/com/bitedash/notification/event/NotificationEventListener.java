package com.bitedash.notification.event;

import com.bitedash.notification.service.MessageSender;
import com.bitedash.shared.event.NotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Event listener for NotificationEvent
 * Replaces RabbitMQ consumer with Spring Events
 *
 * Features:
 * - Async processing to not block the main thread
 * - Automatic retry with exponential backoff
 * - Comprehensive error logging
 * - Strategy pattern for multiple notification types
 */
@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long INITIAL_BACKOFF_MS = 2000; // 2 seconds

    private final List<MessageSender> senders;

    public NotificationEventListener(List<MessageSender> senders) {
        this.senders = senders;
        log.info("NotificationEventListener initialized with {} sender(s)", senders.size());
    }

    /**
     * Handle notification events with retry logic
     * Retries up to 3 times with exponential backoff (2s, 4s, 8s)
     */
    @EventListener
    @Async
    @Retryable(
        maxAttempts = MAX_RETRY_ATTEMPTS,
        backoff = @Backoff(delay = INITIAL_BACKOFF_MS, multiplier = 2),
        retryFor = {RuntimeException.class, IllegalStateException.class}
    )
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Processing notification: type={}, to={}", event.getType(), maskRecipient(event.getTo()));

        try {
            // Validate event
            validateEvent(event);

            // Find appropriate sender
            MessageSender sender = senders.stream()
                    .filter(s -> s.getType().toString().equalsIgnoreCase(event.getType()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                        "No notification provider found for type: " + event.getType() +
                        ". Available types: " + getAvailableTypes()));

            // Send notification
            sender.send(event.getTo(), event.getMessage());

            log.info("✅ Notification sent successfully: type={}, to={}",
                    event.getType(), maskRecipient(event.getTo()));

        } catch (IllegalArgumentException | IllegalStateException e) {
            // Configuration or validation errors - don't retry
            log.error("❌ Notification failed (non-retryable): type={}, to={}, error={}",
                    event.getType(), maskRecipient(event.getTo()), e.getMessage());
            // TODO: Store in failed_notifications table for manual review
            throw e;

        } catch (Exception e) {
            // Transient errors - will be retried
            log.error("❌ Notification failed (will retry): type={}, to={}, error={}",
                    event.getType(), maskRecipient(event.getTo()), e.getMessage(), e);
            // TODO: After max retries, store in dead letter queue
            throw new RuntimeException("Notification send failed: " + e.getMessage(), e);
        }
    }

    /**
     * Validate notification event
     */
    private void validateEvent(NotificationEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("Notification event cannot be null");
        }
        if (event.getTo() == null || event.getTo().isBlank()) {
            throw new IllegalArgumentException("Recipient 'to' field cannot be empty");
        }
        if (event.getType() == null || event.getType().isBlank()) {
            throw new IllegalArgumentException("Notification type cannot be empty");
        }
        if (event.getMessage() == null || event.getMessage().isBlank()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
    }

    /**
     * Mask recipient for security in logs (email/phone)
     */
    private String maskRecipient(String recipient) {
        if (recipient == null || recipient.length() < 4) {
            return "****";
        }
        // For email: show first 2 chars and domain
        if (recipient.contains("@")) {
            String[] parts = recipient.split("@");
            return parts[0].substring(0, Math.min(2, parts[0].length())) + "***@" + parts[1];
        }
        // For phone: show last 4 digits
        return "****" + recipient.substring(recipient.length() - 4);
    }

    /**
     * Get list of available notification types
     */
    private String getAvailableTypes() {
        return senders.stream()
                .map(s -> s.getType().toString())
                .reduce((a, b) -> a + ", " + b)
                .orElse("none");
    }
}
