package com.bitedash.order.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Random;

@Service
public class QRCodeService {

	@Value("${qr.secret.key}")
	private String secretKey;

	private static final String HMAC_ALGORITHM = "HmacSHA256";

	public String generateOrderNumber() {
		LocalDate today = LocalDate.now();
		String datePart = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String randomPart = String.format("%05d", new Random().nextInt(100000));
		return "ORD-" + datePart + "-" + randomPart;
	}

	public String generateQRCodeData(Long orderId, String orderNumber) {
		try {
			long timestamp = System.currentTimeMillis();

			String dataToSign = orderId + "|" + orderNumber + "|" + timestamp;

			String signature = generateHMAC(dataToSign);

			String jsonData = String.format(
				"{\"orderId\":%d,\"orderNumber\":\"%s\",\"timestamp\":%d,\"signature\":\"%s\"}",
				orderId, orderNumber, timestamp, signature
			);

			return Base64.getEncoder().encodeToString(jsonData.getBytes(StandardCharsets.UTF_8));

		} catch (Exception e) {
			throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
		}
	}

	public boolean verifyQRCodeData(String qrCodeData) {
		try {
			String jsonData = new String(Base64.getDecoder().decode(qrCodeData), StandardCharsets.UTF_8);

			Long orderId = extractValue(jsonData, "orderId", Long.class);
			String orderNumber = extractValue(jsonData, "orderNumber", String.class);
			Long timestamp = extractValue(jsonData, "timestamp", Long.class);
			String providedSignature = extractValue(jsonData, "signature", String.class);

			long currentTime = System.currentTimeMillis();
			long maxAge = 24 * 60 * 60 * 1000;
			if (currentTime - timestamp > maxAge) {
				return false;
			}

			String dataToSign = orderId + "|" + orderNumber + "|" + timestamp;
			String expectedSignature = generateHMAC(dataToSign);

			return expectedSignature.equals(providedSignature);

		} catch (Exception e) {
			return false;
		}
	}

	private String generateHMAC(String data) throws Exception {
		Mac mac = Mac.getInstance(HMAC_ALGORITHM);
		SecretKeySpec secretKeySpec = new SecretKeySpec(
			secretKey.getBytes(StandardCharsets.UTF_8),
			HMAC_ALGORITHM
		);
		mac.init(secretKeySpec);
		byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
		return Base64.getEncoder().encodeToString(hmacBytes);
	}

	@SuppressWarnings("unchecked")
	private <T> T extractValue(String json, String key, Class<T> type) {
		String pattern = "\"" + key + "\":";
		int startIndex = json.indexOf(pattern) + pattern.length();

		if (type == String.class) {
			startIndex++;
			int endIndex = json.indexOf("\"", startIndex);
			return (T) json.substring(startIndex, endIndex);
		} else if (type == Long.class) {
			int endIndex = json.indexOf(",", startIndex);
			if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
			String value = json.substring(startIndex, endIndex).trim();
			return (T) Long.valueOf(value);
		}
		return null;
	}

	public Long extractOrderId(String qrCodeData) {
		try {
			String jsonData = new String(Base64.getDecoder().decode(qrCodeData), StandardCharsets.UTF_8);
			return extractValue(jsonData, "orderId", Long.class);
		} catch (Exception e) {
			return null;
		}
	}
}
