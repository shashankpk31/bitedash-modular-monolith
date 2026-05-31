package com.bitedash.payment.service;

import com.bitedash.payment.dto.response.PaymentOrderResponse;
import com.bitedash.payment.entity.Transaction;
import com.bitedash.payment.repository.TransactionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.codec.binary.Hex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for communicating with Razorpay (or Razorpay Simulator).
 *
 * This service provides methods to:
 * - Create payment orders
 * - Verify payment signatures
 * - Process webhooks
 * - Fetch payment details
 *
 * Configuration: Change base-url to switch between simulator and production.
 */
@Service
public class RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

    @Value("${razorpay.base-url:http://localhost:9000}")
    private String baseUrl;

    @Value("${razorpay.key-id:rzp_test_simulator}")
    private String keyId;

    @Value("${razorpay.key-secret:sim_secret_key_12345}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:whsec_simulator_webhook_secret}")
    private String webhookSecret;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final TransactionRepository transactionRepository;

    public RazorpayService(TransactionRepository transactionRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.transactionRepository = transactionRepository;
    }

    /**
     * Create a payment order for wallet top-up.
     *
     * @param amountInRupees Amount in rupees
     * @param userId User ID for whom the order is created
     * @param description Payment description
     * @return PaymentOrderResponse with order details and checkout URL
     */
    public PaymentOrderResponse createOrder(BigDecimal amountInRupees, Long userId, String description) {
        log.info("Creating Razorpay order for user: {}, amount: ₹{}", userId, amountInRupees);

        // Convert rupees to paise (Razorpay uses smallest currency unit)
        long amountInPaise = amountInRupees.multiply(new BigDecimal(100)).longValue();

        // Create receipt ID
        String receipt = "wallet_topup_" + userId + "_" + System.currentTimeMillis();

        // Build request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("amount", amountInPaise);
        requestBody.put("currency", "INR");
        requestBody.put("receipt", receipt);
        requestBody.put("notes", Map.of(
            "user_id", userId.toString(),
            "description", description != null ? description : "Wallet Top-up",
            "type", "WALLET_TOPUP"
        ));

        // Create HTTP headers with Basic Auth
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(keyId, keySecret);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<PaymentOrderResponse> response = restTemplate.postForEntity(
                baseUrl + "/v1/orders",
                entity,
                PaymentOrderResponse.class
            );

            PaymentOrderResponse order = response.getBody();
            if (order != null) {
                // Add checkout URL and key ID for frontend
                order.setCheckoutUrl(baseUrl + "/checkout/" + order.getId());
                order.setKeyId(keyId);

                // Save transaction record
                saveTransaction(order, userId, amountInRupees, description);

                log.info("Razorpay order created: {}", order.getId());
            }

            return order;

        } catch (Exception e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment order: " + e.getMessage(), e);
        }
    }

    /**
     * Verify payment signature after successful payment.
     *
     * @param orderId Razorpay order ID
     * @param paymentId Razorpay payment ID
     * @param signature Signature to verify
     * @return true if signature is valid
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                keySecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Hex.encodeHexString(hash);

            boolean valid = expectedSignature.equals(signature);
            log.info("Payment signature verification: {} (order: {}, payment: {})",
                valid ? "VALID" : "INVALID", orderId, paymentId);

            return valid;

        } catch (Exception e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verify webhook signature.
     *
     * @param payload Raw webhook payload
     * @param signature X-Razorpay-Signature header value
     * @return true if signature is valid
     */
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                webhookSecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Hex.encodeHexString(hash);

            return expectedSignature.equals(signature);

        } catch (Exception e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Fetch payment details from Razorpay.
     *
     * @param paymentId Razorpay payment ID
     * @return Payment details as JsonNode
     */
    public JsonNode fetchPayment(String paymentId) {
        log.info("Fetching payment details: {}", paymentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(keyId, keySecret);

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/v1/payments/" + paymentId,
                HttpMethod.GET,
                entity,
                String.class
            );

            return objectMapper.readTree(response.getBody());

        } catch (Exception e) {
            log.error("Failed to fetch payment: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch payment details: " + e.getMessage(), e);
        }
    }

    /**
     * Fetch order details from Razorpay.
     *
     * @param orderId Razorpay order ID
     * @return Order details as JsonNode
     */
    public JsonNode fetchOrder(String orderId) {
        log.info("Fetching order details: {}", orderId);

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(keyId, keySecret);

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/v1/orders/" + orderId,
                HttpMethod.GET,
                entity,
                String.class
            );

            return objectMapper.readTree(response.getBody());

        } catch (Exception e) {
            log.error("Failed to fetch order: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch order details: " + e.getMessage(), e);
        }
    }

    /**
     * Create refund for a payment.
     *
     * @param paymentId Razorpay payment ID
     * @param amountInPaise Amount to refund in paise (null for full refund)
     * @return Refund details
     */
    public JsonNode createRefund(String paymentId, Long amountInPaise) {
        log.info("Creating refund for payment: {}, amount: {}", paymentId, amountInPaise);

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(keyId, keySecret);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        if (amountInPaise != null) {
            requestBody.put("amount", amountInPaise);
        }
        requestBody.put("speed", "normal");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/v1/payments/" + paymentId + "/refund",
                entity,
                String.class
            );

            return objectMapper.readTree(response.getBody());

        } catch (Exception e) {
            log.error("Failed to create refund: {}", e.getMessage());
            throw new RuntimeException("Failed to create refund: " + e.getMessage(), e);
        }
    }

    /**
     * Save transaction record in database.
     */
    private void saveTransaction(PaymentOrderResponse order, Long userId, BigDecimal amount, String description) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setRazorpayOrderId(order.getId());
        transaction.setAmount(amount);
        transaction.setTotalCharged(amount);  // No fees for wallet top-up
        transaction.setCurrency("INR");
        transaction.setStatus("CREATED");
        transaction.setType("WALLET_TOPUP");
        transaction.setPaymentType("WALLET_TOPUP");
        transaction.setDescription(description != null ? description : "Wallet Top-up");
        transactionRepository.save(transaction);
    }

    /**
     * Update transaction status after payment.
     */
    public void updateTransactionStatus(String orderId, String paymentId, String status) {
        transactionRepository.findByRazorpayOrderId(orderId).ifPresent(transaction -> {
            transaction.setRazorpayPaymentId(paymentId);
            transaction.setStatus(status);
            transactionRepository.save(transaction);
            log.info("Transaction updated: order={}, status={}", orderId, status);
        });
    }

    /**
     * Get transaction by Razorpay order ID.
     */
    public Transaction getTransactionByOrderId(String orderId) {
        return transactionRepository.findByRazorpayOrderId(orderId).orElse(null);
    }

    // Getters for configuration (used by controller)
    public String getBaseUrl() {
        return baseUrl;
    }

    public String getKeyId() {
        return keyId;
    }
}
