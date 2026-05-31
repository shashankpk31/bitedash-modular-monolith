package com.bitedash.order.service;

import com.bitedash.order.dto.request.OrderItemRequest;
import com.bitedash.order.dto.request.OrderRequest;
import com.bitedash.order.dto.request.RateOrderRequest;
import com.bitedash.order.dto.response.OrderResponse;
import com.bitedash.order.dto.response.OrderStatusHistoryResponse;
import com.bitedash.order.entity.Order;
import com.bitedash.order.entity.OrderStatusHistory;
import com.bitedash.order.repository.OrderRepository;
import com.bitedash.order.repository.OrderStatusHistoryRepository;
import com.bitedash.order.websocket.OrderUpdatePublisher;
import com.bitedash.shared.api.menu.MenuPublicService;
import com.bitedash.shared.api.payment.PaymentPublicService;
import com.bitedash.shared.api.wallet.WalletPublicService;
import com.bitedash.shared.util.UserContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for OrderService.
 * Tests cover: Order creation, status updates, rating, retrieval, vendor authorization.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Tests")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private QRCodeService qrCodeService;

    @Mock
    private OrderUpdatePublisher orderUpdatePublisher;

    @Mock
    private PaymentPublicService paymentPublicService;

    @Mock
    private WalletPublicService walletPublicService;

    @Mock
    private MenuPublicService menuPublicService;

    @InjectMocks
    private OrderService orderService;

    private MockedStatic<UserContext> userContextMock;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setOrderNumber("ORD-2026-001234");
        testOrder.setUserId(10L);
        testOrder.setVendorId(5L);
        testOrder.setOrganizationId(1L);
        testOrder.setTotalAmount(new BigDecimal("500.00"));
        testOrder.setCommissionRate(new BigDecimal("0.10"));
        testOrder.setPlatformCommission(new BigDecimal("50.00"));
        testOrder.setVendorPayout(new BigDecimal("450.00"));
        testOrder.setStatus("PENDING");
        testOrder.setPickupOtp("123456");
        testOrder.setQrCodeData("qr-data-encoded");
    }

    @AfterEach
    void tearDown() {
        if (userContextMock != null) {
            userContextMock.close();
        }
    }

    private void mockUserContext(Long userId, String role, Long orgId) {
        userContextMock = mockStatic(UserContext.class);
        UserContext.UserContextHolder holder = new UserContext.UserContextHolder(
            "token", userId, "user@test.com", role, orgId, 1L);
        userContextMock.when(UserContext::get).thenReturn(holder);
    }

    @Nested
    @DisplayName("Create Order Tests")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order with valid items")
        void createOrder_ValidRequest_CreatesOrder() {
            OrderItemRequest itemRequest = new OrderItemRequest();
            itemRequest.setMenuItemId(1L);
            itemRequest.setQuantity(2);
            itemRequest.setUnitPrice(new BigDecimal("250.00"));

            OrderRequest request = new OrderRequest();
            request.setVendorId(5L);
            request.setTotalAmount(new BigDecimal("500.00"));
            request.setItems(Arrays.asList(itemRequest));

            when(menuPublicService.isMenuItemAvailable(1L)).thenReturn(true);
            when(menuPublicService.getMenuItemName(1L)).thenReturn("Butter Chicken");
            when(qrCodeService.generateOrderNumber()).thenReturn("ORD-2026-001234");
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order order = inv.getArgument(0);
                order.setId(1L);
                return order;
            });
            when(qrCodeService.generateQRCodeData(anyLong(), anyString())).thenReturn("qr-data");

            OrderResponse response = orderService.createOrder(request, 10L, 1L);

            assertThat(response).isNotNull();
            verify(walletPublicService).debitForOrder(eq(10L), any(BigDecimal.class), anyLong(), anyString());
            verify(paymentPublicService).logCommission(anyLong(), any(BigDecimal.class), eq(5L), eq(1L));
        }

        @Test
        @DisplayName("Should reject order with unavailable menu item")
        void createOrder_UnavailableItem_ThrowsException() {
            OrderItemRequest itemRequest = new OrderItemRequest();
            itemRequest.setMenuItemId(1L);
            itemRequest.setQuantity(2);
            itemRequest.setUnitPrice(new BigDecimal("250.00"));

            OrderRequest request = new OrderRequest();
            request.setVendorId(5L);
            request.setTotalAmount(new BigDecimal("500.00"));
            request.setItems(Arrays.asList(itemRequest));

            when(menuPublicService.isMenuItemAvailable(1L)).thenReturn(false);
            when(menuPublicService.getMenuItemName(1L)).thenReturn("Sold Out Item");

            assertThatThrownBy(() -> orderService.createOrder(request, 10L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("unavailable");
        }

        @Test
        @DisplayName("Should reject order with mismatched total amount")
        void createOrder_MismatchedTotal_ThrowsException() {
            OrderItemRequest itemRequest = new OrderItemRequest();
            itemRequest.setMenuItemId(1L);
            itemRequest.setQuantity(2);
            itemRequest.setUnitPrice(new BigDecimal("250.00")); // 2 * 250 = 500

            OrderRequest request = new OrderRequest();
            request.setVendorId(5L);
            request.setTotalAmount(new BigDecimal("600.00")); // Wrong total (should be 500)
            request.setItems(Arrays.asList(itemRequest));

            when(menuPublicService.isMenuItemAvailable(1L)).thenReturn(true);

            assertThatThrownBy(() -> orderService.createOrder(request, 10L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid order total");
        }

        @Test
        @DisplayName("Should fail order if wallet debit fails")
        void createOrder_WalletDebitFails_ThrowsException() {
            OrderItemRequest itemRequest = new OrderItemRequest();
            itemRequest.setMenuItemId(1L);
            itemRequest.setQuantity(2);
            itemRequest.setUnitPrice(new BigDecimal("250.00"));

            OrderRequest request = new OrderRequest();
            request.setVendorId(5L);
            request.setTotalAmount(new BigDecimal("500.00"));
            request.setItems(Arrays.asList(itemRequest));

            when(menuPublicService.isMenuItemAvailable(1L)).thenReturn(true);
            when(qrCodeService.generateOrderNumber()).thenReturn("ORD-2026-001234");
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order order = inv.getArgument(0);
                order.setId(1L);
                return order;
            });
            when(qrCodeService.generateQRCodeData(anyLong(), anyString())).thenReturn("qr-data");
            doThrow(new RuntimeException("Insufficient balance"))
                .when(walletPublicService).debitForOrder(anyLong(), any(BigDecimal.class), anyLong(), anyString());

            assertThatThrownBy(() -> orderService.createOrder(request, 10L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient balance");
        }
    }

    @Nested
    @DisplayName("Update Order Status Tests")
    class UpdateOrderStatusTests {

        @Test
        @DisplayName("Should update status by admin")
        void updateOrderStatus_Admin_UpdatesStatus() {
            mockUserContext(99L, "ROLE_SUPER_ADMIN", null);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

            OrderResponse response = orderService.updateOrderStatus(
                1L, "PREPARING", 99L, "ROLE_SUPER_ADMIN", "Order accepted");

            assertThat(response).isNotNull();
            assertThat(testOrder.getStatus()).isEqualTo("PREPARING");
        }

        @Test
        @DisplayName("Should update status by owning vendor")
        void updateOrderStatus_OwnerVendor_UpdatesStatus() {
            mockUserContext(5L, "ROLE_VENDOR", 1L);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

            OrderResponse response = orderService.updateOrderStatus(
                1L, "PREPARING", 5L, "ROLE_VENDOR", "Started preparing");

            assertThat(response).isNotNull();
            assertThat(testOrder.getStatus()).isEqualTo("PREPARING");
        }

        @Test
        @DisplayName("Should reject status update by non-owner vendor")
        void updateOrderStatus_NonOwnerVendor_ThrowsException() {
            mockUserContext(99L, "ROLE_VENDOR", 1L); // Different vendor ID

            when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder)); // Order belongs to vendor 5

            assertThatThrownBy(() -> orderService.updateOrderStatus(
                1L, "PREPARING", 99L, "ROLE_VENDOR", "Unauthorized"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("permission");
        }

        @Test
        @DisplayName("Should throw exception for non-existing order")
        void updateOrderStatus_NonExisting_ThrowsException() {
            mockUserContext(99L, "ROLE_SUPER_ADMIN", null);

            when(orderRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.updateOrderStatus(
                999L, "PREPARING", 99L, "ROLE_SUPER_ADMIN", "Test"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should publish WebSocket update")
        void updateOrderStatus_PublishesWebSocket() {
            mockUserContext(99L, "ROLE_SUPER_ADMIN", null);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

            orderService.updateOrderStatus(1L, "READY", 99L, "ROLE_SUPER_ADMIN", "Ready for pickup");

            verify(orderUpdatePublisher).publishOrderUpdate(1L, "READY", 5L, 10L);
        }
    }

    @Nested
    @DisplayName("Rate Order Tests")
    class RateOrderTests {

        @Test
        @DisplayName("Should rate delivered order by owner")
        void rateOrder_DeliveredOrder_RatesSuccessfully() {
            testOrder.setStatus("DELIVERED");

            RateOrderRequest request = new RateOrderRequest();
            request.setRating(5);
            request.setFeedback("Excellent food!");

            when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

            OrderResponse response = orderService.rateOrder(1L, request, 10L);

            assertThat(response).isNotNull();
            assertThat(testOrder.getRating()).isEqualTo(5);
            assertThat(testOrder.getFeedback()).isEqualTo("Excellent food!");
        }

        @Test
        @DisplayName("Should reject rating by non-owner")
        void rateOrder_NonOwner_ThrowsException() {
            testOrder.setStatus("DELIVERED");

            RateOrderRequest request = new RateOrderRequest();
            request.setRating(5);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder)); // Order belongs to user 10

            assertThatThrownBy(() -> orderService.rateOrder(1L, request, 99L)) // User 99 tries to rate
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Unauthorized");
        }

        @Test
        @DisplayName("Should reject rating non-delivered order")
        void rateOrder_NotDelivered_ThrowsException() {
            testOrder.setStatus("PREPARING"); // Not delivered

            RateOrderRequest request = new RateOrderRequest();
            request.setRating(5);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

            assertThatThrownBy(() -> orderService.rateOrder(1L, request, 10L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not completed");
        }
    }

    @Nested
    @DisplayName("Get Order Tests")
    class GetOrderTests {

        @Test
        @DisplayName("Should get order by ID")
        void getOrderById_ExistingOrder_ReturnsOrder() {
            when(orderRepository.findWithItemsById(1L)).thenReturn(Optional.of(testOrder));

            OrderResponse response = orderService.getOrderById(1L);

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception for non-existing order")
        void getOrderById_NonExisting_ThrowsException() {
            when(orderRepository.findWithItemsById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.getOrderById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get order by QR code")
        void getOrderByQRCode_ValidQR_ReturnsOrder() {
            when(qrCodeService.verifyQRCodeData("valid-qr")).thenReturn(true);
            when(orderRepository.findByQrCodeData("valid-qr")).thenReturn(Optional.of(testOrder));

            OrderResponse response = orderService.getOrderByQRCode("valid-qr");

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should reject invalid QR code")
        void getOrderByQRCode_InvalidQR_ThrowsException() {
            when(qrCodeService.verifyQRCodeData("invalid-qr")).thenReturn(false);

            assertThatThrownBy(() -> orderService.getOrderByQRCode("invalid-qr"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid QR code");
        }
    }

    @Nested
    @DisplayName("Get User/Vendor Orders Tests")
    class GetOrdersListTests {

        @Test
        @DisplayName("Should get user orders")
        void getUserOrders_ReturnsOrders() {
            Order order2 = new Order();
            order2.setId(2L);
            order2.setUserId(10L);
            order2.setStatus("DELIVERED");

            when(orderRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(10L))
                .thenReturn(Arrays.asList(testOrder, order2));

            List<OrderResponse> orders = orderService.getUserOrders(10L);

            assertThat(orders).hasSize(2);
        }

        @Test
        @DisplayName("Should get vendor orders")
        void getVendorOrders_ReturnsOrders() {
            when(orderRepository.findByVendorIdAndDeletedFalseOrderByCreatedAtDesc(5L))
                .thenReturn(Arrays.asList(testOrder));

            List<OrderResponse> orders = orderService.getVendorOrders(5L);

            assertThat(orders).hasSize(1);
        }

        @Test
        @DisplayName("Should return empty list when no orders")
        void getUserOrders_NoOrders_ReturnsEmptyList() {
            when(orderRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(99L))
                .thenReturn(Arrays.asList());

            List<OrderResponse> orders = orderService.getUserOrders(99L);

            assertThat(orders).isEmpty();
        }
    }

    @Nested
    @DisplayName("Order History Tests")
    class OrderHistoryTests {

        @Test
        @DisplayName("Should get order status history")
        void getOrderHistory_ReturnsHistory() {
            OrderStatusHistory history1 = new OrderStatusHistory();
            history1.setId(1L);
            history1.setOrder(testOrder);
            history1.setPreviousStatus(null);
            history1.setNewStatus("PENDING");

            OrderStatusHistory history2 = new OrderStatusHistory();
            history2.setId(2L);
            history2.setOrder(testOrder);
            history2.setPreviousStatus("PENDING");
            history2.setNewStatus("PREPARING");

            when(orderStatusHistoryRepository.findByOrder_Id(1L))
                .thenReturn(Arrays.asList(history1, history2));

            List<OrderStatusHistoryResponse> history = orderService.getOrderHistory(1L);

            assertThat(history).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Vendor Rating Tests")
    class VendorRatingTests {

        @Test
        @DisplayName("Should get vendor average rating")
        void getVendorAverageRating_ReturnsRating() {
            when(orderRepository.findAverageRatingByVendorId(5L)).thenReturn(4.5);

            Double rating = orderService.getVendorAverageRating(5L);

            assertThat(rating).isEqualTo(4.5);
        }

        @Test
        @DisplayName("Should return null for vendor with no ratings")
        void getVendorAverageRating_NoRatings_ReturnsNull() {
            when(orderRepository.findAverageRatingByVendorId(99L)).thenReturn(null);

            Double rating = orderService.getVendorAverageRating(99L);

            assertThat(rating).isNull();
        }
    }
}
