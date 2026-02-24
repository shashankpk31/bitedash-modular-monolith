package com.bitedash.notification.service;

import com.bitedash.notification.constant.NotificationConstants.NOTIF_TYPE;

/**
 * Message sender interface for different notification types
 */
public interface MessageSender {
	void send(String to, String content);

	NOTIF_TYPE getType();
}
