package com.bitedash.order.service;

import com.bitedash.order.dto.request.OrderRequest;
import com.bitedash.order.dto.request.RateOrderRequest;
import com.bitedash.order.dto.response.OrderResponse;
import com.bitedash.order.dto.response.OrderStatusHistoryResponse;
import com.bitedash.order.entity.Order;
import com.bitedash.order.entity.OrderStatusHistory;
import com.bitedash.order.mapper.OrderMapper;
import com.bitedash.order.repository.OrderRepository;
import com.bitedash.order.repository.OrderStatusHistoryRepository;
import com.bitedash.order.websocket.OrderUpdatePublisher;
import com.bitedash.shared.api.payment.PaymentPublicService;
import com.bitedash.shared.api.wallet.WalletPublicService;
import com.bitedash.shared.api.menu.MenuPublicService;
import com.bitedash.shared.util.UserContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Random;

@Service
public class OrderService {

	private static final Logger log = LoggerFactory.getLogger(OrderService.class);

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private OrderStatusHistoryRepository orderStatusHistoryRepository;

	@Autowired
	private QRCodeService qrCodeService;

	@Autowired
	private OrderUpdatePublisher orderUpdatePublisher;

	@Autowired
	private PaymentPublicService paymentPublicService;

	@Autowired
	private WalletPublicService walletPublicService;

	@Autowired
	private MenuPublicService menuPublicService;

	@Transactional
	public OrderResponse createOrder(OrderRequest request, Long userId, Long organizationId) {
		log.info("Creating order for user: {}, vendor: {}", userId, request.getVendorId());

		// Validate menu item availability
		if (request.getItems() != null && !request.getItems().isEmpty()) {
			for (var item : request.getItems()) {
				if (item.getMenuItemId() != null) {
					if (!menuPublicService.isMenuItemAvailable(item.getMenuItemId())) {
						String itemName = menuPublicService.getMenuItemName(item.getMenuItemId());
						String displayName = itemName != null ? itemName : "ID: " + item.getMenuItemId();
						log.warn("Order creation failed: Menu item {} is not available", displayName);
						throw new RuntimeException("Menu item '" + displayName + "' is currently unavailable");
					}
				}
			}
		}

		log.info("All menu items are available");

		// Validate total amount - recalculate from items to prevent frontend manipulation
		BigDecimal calculatedTotal = BigDecimal.ZERO;
		if (request.getItems() != null && !request.getItems().isEmpty()) {
			for (var item : request.getItems()) {
				if (item.getQuantity() != null && item.getUnitPrice() != null) {
					BigDecimal itemTotal = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
					calculatedTotal = calculatedTotal.add(itemTotal);
				}
			}
		}

		// Allow a small tolerance for rounding differences (0.01)
		BigDecimal difference = request.getTotalAmount().subtract(calculatedTotal).abs();
		if (difference.compareTo(new BigDecimal("0.01")) > 0) {
			log.error("Total amount mismatch for order. Frontend sent: {}, Backend calculated: {}",
				request.getTotalAmount(), calculatedTotal);
			throw new RuntimeException(
				"Invalid order total. Expected: " + calculatedTotal + ", received: " + request.getTotalAmount()
			);
		}

		log.info("Total amount validated: {}", calculatedTotal);

		Order order = OrderMapper.toEntity(request);
		order.setUserId(userId);
		order.setOrganizationId(organizationId);
		order.setStatus("PENDING");

		String orderNumber = generateUniqueOrderNumber();
		order.setOrderNumber(orderNumber);

		BigDecimal totalAmount = request.getTotalAmount();
		BigDecimal commissionRate = order.getCommissionRate();
		BigDecimal platformCommission = totalAmount.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);
		BigDecimal vendorPayout = totalAmount.subtract(platformCommission).setScale(2, RoundingMode.HALF_UP);

		order.setPlatformCommission(platformCommission);
		order.setVendorPayout(vendorPayout);

		order.setPickupOtp(generateOTP());

		order.setCreatedBy(String.valueOf(userId));

		order = orderRepository.save(order);

		String qrCodeData = qrCodeService.generateQRCodeData(order.getId(), orderNumber);
		order.setQrCodeData(qrCodeData);

		order = orderRepository.save(order);

		// Log commission with payment service
		try {
			paymentPublicService.logCommission(
				order.getId(),
				platformCommission,
				request.getVendorId(),
				organizationId
			);
			log.info("Commission logged for order: {}, amount: {}", order.getId(), platformCommission);
		} catch (Exception e) {
			log.error("Failed to log commission for order: {}, error: {}", order.getId(), e.getMessage());
			// Don't fail order creation if commission logging fails
		}

		// Debit user's wallet for order payment
		try {
			log.info("Attempting to debit {} from user {} wallet for order {}", totalAmount, userId, orderNumber);
			walletPublicService.debitForOrder(userId, totalAmount, order.getId(), orderNumber);
			log.info("Successfully debited wallet for order: {}", orderNumber);
		} catch (RuntimeException e) {
			log.error("Wallet debit failed for order {}: {}", orderNumber, e.getMessage());
			// Transaction will rollback due to @Transactional, so order won't be created
			throw new RuntimeException("Order creation failed: " + e.getMessage(), e);
		}

		addStatusHistory(order, null, "PENDING", userId, "ROLE_EMPLOYEE", "Order created");

		log.info("Order created successfully: {}", order.getOrderNumber());

		OrderResponse response = OrderMapper.toResponse(order);

		// Publish new order notification via WebSocket
		try {
			orderUpdatePublisher.publishOrderUpdate(
				order.getId(),
				order.getStatus(),
				order.getVendorId(),
				order.getUserId()
			);
		} catch (Exception e) {
			log.error("Failed to publish new order notification: {}", e.getMessage());
		}

		return response;
	}

	@Transactional
	public OrderResponse updateOrderStatus(Long orderId, String newStatus, Long changedBy, String changedByRole, String remarks) {
		log.info("Updating order {} status to: {}", orderId, newStatus);

		Order order = orderRepository.findById(orderId)
			.orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

		// Validate vendor ownership (admins can update any order)
		var userContext = UserContext.get();
		if (userContext.role() != null &&
		    !"ROLE_SUPER_ADMIN".equals(userContext.role()) &&
		    !"ROLE_ORG_ADMIN".equals(userContext.role())) {
			// For vendors, verify they own this order
			if (!order.getVendorId().equals(changedBy)) {
				log.warn("Vendor {} attempted to update order {} belonging to vendor {}",
					changedBy, orderId, order.getVendorId());
				throw new RuntimeException("You do not have permission to update this order");
			}
		}

		String previousStatus = order.getStatus();
		order.setStatus(newStatus);
		order.setUpdatedBy(String.valueOf(changedBy));

		order = orderRepository.save(order);

		addStatusHistory(order, previousStatus, newStatus, changedBy, changedByRole, remarks);

		OrderResponse response = OrderMapper.toResponse(order);

		// Publish order status update via WebSocket
		try {
			orderUpdatePublisher.publishOrderUpdate(
				orderId,
				newStatus,
				order.getVendorId(),
				order.getUserId()
			);
		} catch (Exception e) {
			log.error("Failed to publish order status update: {}", e.getMessage());
		}

		return response;
	}

	@Transactional
	public OrderResponse rateOrder(Long orderId, RateOrderRequest request, Long userId) {
		log.info("Rating order: {}, rating: {}", orderId, request.getRating());

		Order order = orderRepository.findById(orderId)
			.orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

		if (!order.getUserId().equals(userId)) {
			throw new RuntimeException("Unauthorized: Order does not belong to user");
		}

		// Allow rating once order is delivered
		if (!"DELIVERED".equals(order.getStatus())) {
			throw new RuntimeException("Cannot rate order that is not completed");
		}

		order.setRating(request.getRating());
		order.setFeedback(request.getFeedback());
		order.setUpdatedBy(String.valueOf(userId));

		order = orderRepository.save(order);

		log.info("Order rated successfully: {}", orderId);

		return OrderMapper.toResponse(order);
	}

	public OrderResponse getOrderById(Long orderId) {
		Order order = orderRepository.findWithItemsById(orderId)
			.orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

		return OrderMapper.toResponse(order);
	}

	public OrderResponse getOrderByQRCode(String qrCodeData) {
		log.info("Looking up order by QR code");

		if (!qrCodeService.verifyQRCodeData(qrCodeData)) {
			throw new RuntimeException("Invalid QR code signature");
		}

		Order order = orderRepository.findByQrCodeData(qrCodeData)
			.orElseThrow(() -> new RuntimeException("Order not found for QR code"));

		return OrderMapper.toResponse(order);
	}

	public List<OrderStatusHistoryResponse> getOrderHistory(Long orderId) {
		List<OrderStatusHistory> orderStatusHistory = orderStatusHistoryRepository.findByOrder_Id(orderId);

		return OrderMapper.toHistoryResponseList(orderStatusHistory);
	}

	public List<OrderResponse> getUserOrders(Long userId) {
		List<Order> orders = orderRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId);
		return OrderMapper.toResponseList(orders);
	}

	public List<OrderResponse> getVendorOrders(Long vendorId) {
		List<Order> orders = orderRepository.findByVendorIdAndDeletedFalseOrderByCreatedAtDesc(vendorId);
		return OrderMapper.toResponseList(orders);
	}

	public Double getVendorAverageRating(Long vendorId) {
		return orderRepository.findAverageRatingByVendorId(vendorId);
	}

	private String generateUniqueOrderNumber() {
		int maxRetries = 5;
		for (int i = 0; i < maxRetries; i++) {
			String orderNumber = qrCodeService.generateOrderNumber();
			if (!orderRepository.existsByOrderNumber(orderNumber)) {
				return orderNumber;
			}
		}
		throw new RuntimeException("Failed to generate unique order number after " + maxRetries + " attempts");
	}

	private String generateOTP() {
		return String.format("%06d", new Random().nextInt(1000000));
	}

	private void addStatusHistory(Order order, String previousStatus, String newStatus, Long changedBy,
			String changedByRole, String remarks) {
		OrderStatusHistory history = new OrderStatusHistory();
		history.setOrder(order);
		history.setPreviousStatus(previousStatus);
		history.setNewStatus(newStatus);
		history.setChangedBy(changedBy);
		history.setChangedByRole(changedByRole);
		history.setRemarks(remarks);

		order.addStatusHistory(history);
		orderRepository.save(order);
	}
}
