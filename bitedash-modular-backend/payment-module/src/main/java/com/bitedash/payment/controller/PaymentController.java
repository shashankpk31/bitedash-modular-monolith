package com.bitedash.payment.controller;

import com.bitedash.payment.dto.request.CreatePaymentOrderRequest;
import com.bitedash.payment.dto.request.VerifyPaymentRequest;
import com.bitedash.payment.dto.response.PaymentOrderResponse;
import com.bitedash.payment.dto.response.PaymentStatusResponse;
import com.bitedash.payment.entity.Transaction;
import com.bitedash.payment.service.RazorpayService;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.security.JwtService;
import com.bitedash.wallet.service.WalletService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Map;

/**
 * Payment Controller for Razorpay integration.
 * Handles wallet top-up payments via Razorpay (or simulator).
 */
@RestController
@RequestMapping("/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final RazorpayService razorpayService;
    private final WalletService walletService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    public PaymentController(RazorpayService razorpayService,
                            WalletService walletService,
                            JwtService jwtService) {
        this.razorpayService = razorpayService;
        this.walletService = walletService;
        this.jwtService = jwtService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Create a payment order for wallet top-up.
     *
     * POST /payment/create-order
     * Body: { "amount": 100.00, "description": "Wallet Top-up" }
     *
     * @return PaymentOrderResponse with order ID and checkout URL
     */
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @RequestBody CreatePaymentOrderRequest request,
            HttpServletRequest httpRequest) {

        Long userId = jwtService.extractUserIdFromRequest(httpRequest);
        log.info("Creating payment order for user: {}, amount: {}", userId, request.getAmount());

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // Minimum amount: ₹10
        if (request.getAmount().compareTo(new BigDecimal("10")) < 0) {
            return ResponseEntity.badRequest().build();
        }

        // Maximum amount: ₹50,000
        if (request.getAmount().compareTo(new BigDecimal("50000")) > 0) {
            return ResponseEntity.badRequest().build();
        }

        PaymentOrderResponse order = razorpayService.createOrder(
            request.getAmount(),
            userId,
            request.getDescription()
        );

        return ResponseEntity.ok(order);
    }

    /**
     * Verify payment after successful checkout.
     * Called by frontend after Razorpay checkout completes.
     *
     * POST /payment/verify
     * Body: { "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyPayment(
            @RequestBody VerifyPaymentRequest request,
            HttpServletRequest httpRequest) {

        Long userId = jwtService.extractUserIdFromRequest(httpRequest);
        log.info("Verifying payment for user: {}, order: {}", userId, request.getRazorpayOrderId());

        // Verify signature
        boolean isValid = razorpayService.verifyPaymentSignature(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature()
        );

        if (!isValid) {
            log.warn("Invalid payment signature for order: {}", request.getRazorpayOrderId());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid payment signature"));
        }

        // Get transaction details
        Transaction transaction = razorpayService.getTransactionByOrderId(request.getRazorpayOrderId());
        if (transaction == null) {
            log.error("Transaction not found for order: {}", request.getRazorpayOrderId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Transaction not found"));
        }

        // Verify user owns this transaction
        if (!transaction.getUserId().equals(userId)) {
            log.warn("User {} attempted to verify payment for user {}", userId, transaction.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Unauthorized"));
        }

        // Update transaction status
        razorpayService.updateTransactionStatus(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            "CAPTURED"
        );

        // Credit wallet
        try {
            walletService.creditWallet(userId, transaction.getAmount(), "Wallet top-up via Razorpay");
            log.info("Wallet credited for user: {}, amount: {}", userId, transaction.getAmount());
        } catch (Exception e) {
            log.error("Failed to credit wallet for user: {}", userId, e);
            // Transaction is already marked as CAPTURED, but wallet credit failed
            // This should trigger a manual review or retry
            razorpayService.updateTransactionStatus(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                "CREDIT_FAILED"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Payment verified but wallet credit failed. Please contact support."));
        }

        Map<String, Object> paymentData = Map.of(
            "amount", transaction.getAmount(),
            "orderId", request.getRazorpayOrderId(),
            "paymentId", request.getRazorpayPaymentId()
        );

        return ResponseEntity.ok(ApiResponse.success("Payment verified and wallet credited", paymentData));
    }

    /**
     * Webhook handler for Razorpay events.
     * Called by Razorpay when payment status changes.
     *
     * POST /payment/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        log.info("Received Razorpay webhook");

        // Verify webhook signature
        if (signature != null && !razorpayService.verifyWebhookSignature(payload, signature)) {
            log.warn("Invalid webhook signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", "invalid_signature"));
        }

        try {
            JsonNode event = objectMapper.readTree(payload);
            String eventType = event.path("event").asText();

            log.info("Webhook event type: {}", eventType);

            switch (eventType) {
                case "payment.captured":
                    handlePaymentCaptured(event);
                    break;
                case "payment.failed":
                    handlePaymentFailed(event);
                    break;
                case "refund.created":
                    handleRefundCreated(event);
                    break;
                default:
                    log.info("Unhandled webhook event: {}", eventType);
            }

            return ResponseEntity.ok(Map.of("status", "processed"));

        } catch (Exception e) {
            log.error("Failed to process webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    /**
     * Get payment status by order ID.
     *
     * GET /payment/status/{orderId}
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(
            @PathVariable String orderId,
            HttpServletRequest httpRequest) {

        Long userId = jwtService.extractUserIdFromRequest(httpRequest);

        Transaction transaction = razorpayService.getTransactionByOrderId(orderId);
        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }

        // Verify user owns this transaction
        if (!transaction.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        PaymentStatusResponse response = new PaymentStatusResponse();
        response.setOrderId(orderId);
        response.setPaymentId(transaction.getRazorpayPaymentId());
        response.setStatus(transaction.getStatus());
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setCreatedAt(transaction.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * Get Razorpay key ID for frontend.
     * This is safe to expose - it's the public key.
     *
     * GET /payment/config
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getPaymentConfig() {
        return ResponseEntity.ok(Map.of(
            "keyId", razorpayService.getKeyId(),
            "currency", "INR"
        ));
    }

    // ========== Webhook Handlers ==========

    private void handlePaymentCaptured(JsonNode event) {
        JsonNode payment = event.path("payload").path("payment").path("entity");
        String orderId = payment.path("order_id").asText();
        String paymentId = payment.path("id").asText();

        log.info("Payment captured: order={}, payment={}", orderId, paymentId);

        Transaction transaction = razorpayService.getTransactionByOrderId(orderId);
        if (transaction != null && !"CAPTURED".equals(transaction.getStatus())) {
            razorpayService.updateTransactionStatus(orderId, paymentId, "CAPTURED");

            // Credit wallet if not already done
            try {
                walletService.creditWallet(transaction.getUserId(), transaction.getAmount(),
                    "Wallet top-up via Razorpay (webhook)");
                log.info("Wallet credited via webhook for user: {}", transaction.getUserId());
            } catch (Exception e) {
                log.error("Failed to credit wallet via webhook: {}", e.getMessage());
            }
        }
    }

    private void handlePaymentFailed(JsonNode event) {
        JsonNode payment = event.path("payload").path("payment").path("entity");
        String orderId = payment.path("order_id").asText();
        String paymentId = payment.path("id").asText();

        log.info("Payment failed: order={}, payment={}", orderId, paymentId);
        razorpayService.updateTransactionStatus(orderId, paymentId, "FAILED");
    }

    private void handleRefundCreated(JsonNode event) {
        JsonNode refund = event.path("payload").path("refund").path("entity");
        String paymentId = refund.path("payment_id").asText();

        log.info("Refund created for payment: {}", paymentId);
        // Handle refund logic if needed
    }
}
