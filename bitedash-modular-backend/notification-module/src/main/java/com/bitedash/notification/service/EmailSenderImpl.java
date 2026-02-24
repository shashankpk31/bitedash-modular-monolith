package com.bitedash.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.bitedash.notification.constant.NotificationConstants.NOTIF_TYPE;

@Service
public class EmailSenderImpl implements MessageSender {

	private static final Logger log = LoggerFactory.getLogger(EmailSenderImpl.class);

	private final JavaMailSender mailSender;

	@Value("${spring.mail.username:}")
	private String fromEmail;

	@Value("${spring.mail.host:}")
	private String mailHost;

	public EmailSenderImpl(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}

	@Override
	public void send(String to, String content) {
		// Validate configuration
		if (mailHost == null || mailHost.isEmpty()) {
			log.error("Email service not configured. Set MAIL_HOST environment variable.");
			throw new IllegalStateException("Email service not configured. Check MAIL_HOST configuration.");
		}

		if (fromEmail == null || fromEmail.isEmpty()) {
			log.warn("MAIL_USERNAME not set. Using default 'noreply@bitedash.com'");
			fromEmail = "noreply@bitedash.com";
		}

		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom(fromEmail);
			message.setTo(to);
			message.setSubject("BiteDash Verification Code");
			message.setText(buildEmailContent(content));

			mailSender.send(message);
			log.info("Email sent successfully to: {} via {}", to, mailHost);

		} catch (MailException e) {
			log.error("Failed to send email to {}: {}", to, e.getMessage());
			throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
		}
	}

	private String buildEmailContent(String content) {
		return String.format("""
			Hello,

			%s

			If you did not request this, please ignore this email.

			Best regards,
			BiteDash Team
			""", content);
	}

	@Override
	public NOTIF_TYPE getType() {
		return NOTIF_TYPE.EMAIL;
	}

}
