package com.bitedash.identity.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.bitedash.shared.event.NotificationEvent;
import com.bitedash.shared.event.UserRegisteredEvent;

/**
 * Listens for UserRegisteredEvent and triggers OTP notification
 * Bridges the gap between user registration and notification system
 */
@Component
public class UserRegistrationListener {

    private static final Logger log = LoggerFactory.getLogger(UserRegistrationListener.class);

    private final StringRedisTemplate redisTemplate;
    private final ApplicationEventPublisher eventPublisher;

    public UserRegistrationListener(StringRedisTemplate redisTemplate,
                                   ApplicationEventPublisher eventPublisher) {
        this.redisTemplate = redisTemplate;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Handle user registration event and send OTP notification
     * Processes asynchronously to not block registration
     */
    @EventListener
    @Async
    public void handleUserRegistered(UserRegisteredEvent event) {
        String identifier = event.getEmail(); // Actually email or phone number

        log.info("Processing registration notification for user: {} (ID: {})",
                event.getName(), event.getUserId());

        try {
            // 1. Retrieve OTP from Redis
            String otp = redisTemplate.opsForValue().get("OTP:" + identifier);

            if (otp == null) {
                log.error("OTP not found in Redis for identifier: {}. Registration may have timed out.",
                        maskIdentifier(identifier));
                return;
            }

            // 2. Determine notification type based on identifier format
            String notificationType = determineNotificationType(identifier);

            // 3. Build OTP message
            String message = buildOtpMessage(event.getName(), otp);

            // 4. Publish NotificationEvent to trigger email/SMS
            NotificationEvent notificationEvent = new NotificationEvent(
                identifier,
                message,
                notificationType
            );

            eventPublisher.publishEvent(notificationEvent);

            log.info("✅ OTP notification queued for user {} via {}",
                    event.getUserId(), notificationType);

        } catch (Exception e) {
            log.error("❌ Failed to process registration notification for user {}: {}",
                    event.getUserId(), e.getMessage(), e);
            // Don't throw exception - registration already succeeded
            // User can use "Resend OTP" if needed
        }
    }

    /**
     * Determine if identifier is email or phone number
     */
    private String determineNotificationType(String identifier) {
        if (identifier == null || identifier.isEmpty()) {
            return "EMAIL"; // Default to email
        }

        // Simple heuristic: contains @ = email, otherwise phone
        return identifier.contains("@") ? "EMAIL" : "SMS";
    }

    /**
     * Build OTP notification message
     */
    private String buildOtpMessage(String userName, String otp) {
        return String.format(
            "Welcome to BiteDash, %s!\n\n" +
            "Your verification code is: %s\n\n" +
            "This code is valid for 5 minutes.\n\n" +
            "If you didn't request this code, please ignore this message.\n\n" +
            "Best regards,\n" +
            "BiteDash Team",
            userName, otp
        );
    }

    /**
     * Mask identifier for logging (security/privacy)
     */
    private String maskIdentifier(String identifier) {
        if (identifier == null || identifier.length() < 4) {
            return "****";
        }

        // For email: show first 2 chars and domain
        if (identifier.contains("@")) {
            String[] parts = identifier.split("@");
            return parts[0].substring(0, Math.min(2, parts[0].length())) + "***@" + parts[1];
        }

        // For phone: show last 4 digits
        return "****" + identifier.substring(identifier.length() - 4);
    }
}
