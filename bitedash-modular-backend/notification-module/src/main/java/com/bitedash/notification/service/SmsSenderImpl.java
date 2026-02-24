package com.bitedash.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bitedash.notification.constant.NotificationConstants;
import com.bitedash.notification.constant.NotificationConstants.NOTIF_TYPE;
import com.twilio.Twilio;
import com.twilio.exception.TwilioException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import jakarta.annotation.PostConstruct;

@Service
public class SmsSenderImpl implements MessageSender {

    private static final Logger log = LoggerFactory.getLogger(SmsSenderImpl.class);

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:}")
    private String fromNumber;

    private boolean twilioConfigured = false;

    @PostConstruct
    public void initTwilio() {
        try {
            // Check if Twilio is properly configured
            if (accountSid == null || accountSid.isEmpty() ||
                authToken == null || authToken.isEmpty() ||
                fromNumber == null || fromNumber.isEmpty()) {

                log.warn("Twilio SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.");
                twilioConfigured = false;
                return;
            }

            // Validate Account SID format
            if (!accountSid.startsWith("AC") || accountSid.length() != 34) {
                log.error("Invalid Twilio Account SID format. Must start with 'AC' and be 34 characters long.");
                twilioConfigured = false;
                return;
            }

            Twilio.init(accountSid, authToken);
            twilioConfigured = true;
            log.info("Twilio SMS service initialized successfully with number: {}", maskPhoneNumber(fromNumber));

        } catch (Exception e) {
            log.error("Failed to initialize Twilio: {}", e.getMessage());
            twilioConfigured = false;
        }
    }

    @Override
    public void send(String to, String content) {
        // Check if Twilio is configured
        if (!twilioConfigured) {
            log.error("SMS service not available. Twilio is not properly configured.");
            throw new IllegalStateException("SMS service not configured. Check Twilio credentials.");
        }

        try {
            // Validate phone number format (basic check)
            if (!to.startsWith("+")) {
                log.warn("Phone number should include country code with + prefix: {}", to);
            }

            Message message = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromNumber),
                    content)
                .create();

            log.info("SMS sent successfully to: {} | Message SID: {}", maskPhoneNumber(to), message.getSid());

        } catch (TwilioException e) {
            log.error("Twilio API error sending SMS to {}: {}",
                    maskPhoneNumber(to), e.getMessage());
            throw new RuntimeException("Failed to send SMS via Twilio: " + e.getMessage(), e);

        } catch (Exception e) {
            log.error("Unexpected error sending SMS to {}: {}", maskPhoneNumber(to), e.getMessage());
            throw new RuntimeException("Failed to send SMS: " + e.getMessage(), e);
        }
    }

    /**
     * Mask phone number for logging (show only last 4 digits)
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) {
            return "****";
        }
        return "****" + phoneNumber.substring(phoneNumber.length() - 4);
    }

    @Override
    public NOTIF_TYPE getType() {
        return NotificationConstants.NOTIF_TYPE.SMS;
    }
}
