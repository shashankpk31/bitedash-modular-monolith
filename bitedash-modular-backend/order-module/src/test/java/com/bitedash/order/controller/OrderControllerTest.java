package com.bitedash.order.controller;

import com.bitedash.order.dto.request.OrderRequest;
import com.bitedash.order.dto.request.RateOrderRequest;
import com.bitedash.order.dto.response.OrderResponse;
import com.bitedash.order.dto.response.OrderStatusHistoryResponse;
import com.bitedash.order.service.OrderService;
import com.bitedash.shared.aspect.RoleCheckAspect;
import com.bitedash.shared.util.UserContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive integration tests for OrderController.
 *
 * Tests cover:
 * - All REST endpoints (createOrder, getOrderById, getMyOrders, etc.)
 * - Authorization checks (IDOR protection, role-based access)
 * - Input validation (rating range, required fields)
 * - UserContext handling for different user roles
 * - Edge cases and error scenarios
 *
 * Uses JUnit 5 + MockMvc + Mockito for isolated controller testing.
 *
 * Note: This test uses a minimal Spring Boot configuration for the order-module.
 * The RoleCheckAspect is imported to test @RequireRole annotation behavior.
 */
@WebMvcTest(controllers = OrderController.class)
@ContextConfiguration(classes = {com.bitedash.order.config.TestApplication.class})
@Import(RoleCheckAspect.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    // Test data constants
    private static final Long TEST_USER_ID = 100L;
    private static final Long OTHER_USER_ID = 200L;
    private static final Long TEST_VENDOR_ID = 10L;
    private static final Long OTHER_VENDOR_ID = 20L;
    private static final Long TEST_ORDER_ID = 1L;
    private static final Long TEST_ORG_ID = 5L;
    private static final String ORDER_NUMBER = "ORD-2026-001";

    /**
     * Clean up UserContext after each test to prevent test pollution.
     * Why: UserContext uses ThreadLocal which persists between tests if not cleared.
     */
    @AfterEach
    void clearUserContext() {
        UserContext.clear();
    }

    /**
     * Helper method to setup UserContext with EMPLOYEE role.
     * Why: Most tests need a regular employee user context for authorization.
     */
    private void setupEmployeeContext() {
        UserContext.set(new UserContext.UserContextHolder(
            "Bearer token",
            TEST_USER_ID,
            "employee@example.com",
            "ROLE_EMPLOYEE",
            TEST_ORG_ID,
            1L
        ));
    }

    /**
     * Helper method to setup UserContext with VENDOR role.
     * Why: Vendor-specific operations require ROLE_VENDOR for authorization.
     */
    private void setupVendorContext(Long vendorId) {
        UserContext.set(new UserContext.UserContextHolder(
            "Bearer token",
            vendorId,
            "vendor@example.com",
            "ROLE_VENDOR",
            TEST_ORG_ID,
            1L
        ));
    }

    /**
     * Helper method to setup UserContext with ORG_ADMIN role.
     * Why: Admins have elevated privileges to view any order.
     */
    private void setupOrgAdminContext() {
        UserContext.set(new UserContext.UserContextHolder(
            "Bearer token",
            999L,
            "admin@example.com",
            "ROLE_ORG_ADMIN",
            TEST_ORG_ID,
            1L
        ));
    }

    /**
     * Helper method to setup UserContext with SUPER_ADMIN role.
     * Why: Super admins have highest privileges across all organizations.
     */
    private void setupSuperAdminContext() {
        UserContext.set(new UserContext.UserContextHolder(
            "Bearer token",
            1000L,
            "superadmin@example.com",
            "ROLE_SUPER_ADMIN",
            null,
            null
        ));
    }

    /**
     * Helper method to create a sample OrderResponse for testing.
     * Why: Reduces boilerplate in tests and ensures consistent test data.
     */
    private OrderResponse createSampleOrderResponse(Long orderId, Long userId, Long vendorId) {
        OrderResponse response = new OrderResponse();
        response.setId(orderId);
        response.setOrderNumber(ORDER_NUMBER);
        response.setUserId(userId);
        response.setVendorId(vendorId);
        response.setCafeteriaId(1L);
        response.setOfficeId(1L);
        response.setOrganizationId(TEST_ORG_ID);
        response.setTotalAmount(new BigDecimal("250.00"));
        response.setStatus("PENDING");
        response.setOrderType("DINE_IN");
        response.setCreatedAt(LocalDateTime.now());
        response.setUpdatedAt(LocalDateTime.now());
        return response;
    }

    /**
     * Helper method to create a sample OrderRequest for testing.
     * Why: Standardizes order creation requests across tests.
     */
    private OrderRequest createSampleOrderRequest() {
        OrderRequest request = new OrderRequest();
        request.setVendorId(TEST_VENDOR_ID);
        request.setCafeteriaId(1L);
        request.setOfficeId(1L);
        request.setTotalAmount(new BigDecimal("250.00"));
        request.setOrderType("DINE_IN");
        request.setItems(Collections.emptyList());
        return request;
    }

    // ========================================
    // Test Suite: POST /orders (createOrder)
    // ========================================

    @Nested
    @DisplayName("POST /orders - Create Order Tests")
    class CreateOrderTests {

        @Test
        @DisplayName("Should successfully create order when user has valid organization")
        void testCreateOrder_Success() throws Exception {
            // Why: Verify that authenticated users with org ID can create orders
            setupEmployeeContext();

            OrderRequest request = createSampleOrderRequest();
            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);

            when(orderService.createOrder(any(OrderRequest.class), eq(TEST_USER_ID), eq(TEST_ORG_ID)))
                .thenReturn(response);

            mockMvc.perform(post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Order created successfully"))
                .andExpect(jsonPath("$.data.id").value(TEST_ORDER_ID))
                .andExpect(jsonPath("$.data.userId").value(TEST_USER_ID))
                .andExpect(jsonPath("$.data.vendorId").value(TEST_VENDOR_ID));

            verify(orderService).createOrder(any(OrderRequest.class), eq(TEST_USER_ID), eq(TEST_ORG_ID));
        }

        @Test
        @DisplayName("Should fail when user has no organization ID")
        void testCreateOrder_MissingOrganizationId() throws Exception {
            // Why: Business rule requires organization context for order creation
            UserContext.set(new UserContext.UserContextHolder(
                "Bearer token",
                TEST_USER_ID,
                "user@example.com",
                "ROLE_EMPLOYEE",
                null, // No org ID
                1L
            ));

            OrderRequest request = createSampleOrderRequest();

            mockMvc.perform(post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Organization ID is required to create an order"));

            verify(orderService, never()).createOrder(any(), anyLong(), anyLong());
        }

        @Test
        @DisplayName("Should handle service exceptions gracefully")
        void testCreateOrder_ServiceException() throws Exception {
            // Why: Ensure proper error handling when business logic fails
            setupEmployeeContext();

            OrderRequest request = createSampleOrderRequest();

            when(orderService.createOrder(any(OrderRequest.class), eq(TEST_USER_ID), eq(TEST_ORG_ID)))
                .thenThrow(new RuntimeException("Insufficient wallet balance"));

            mockMvc.perform(post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to create order: Insufficient wallet balance"));
        }
    }

    // ========================================
    // Test Suite: GET /orders/{id} (getOrderById)
    // ========================================

    @Nested
    @DisplayName("GET /orders/{id} - Get Order By ID Tests")
    class GetOrderByIdTests {

        @Test
        @DisplayName("Should allow user to view their own order")
        void testGetOrderById_Owner_Success() throws Exception {
            // Why: Users must be able to view their own orders (IDOR protection passes)
            setupEmployeeContext();

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(response);

            mockMvc.perform(get("/orders/{id}", TEST_ORDER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(TEST_ORDER_ID))
                .andExpect(jsonPath("$.data.userId").value(TEST_USER_ID));

            verify(orderService).getOrderById(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should block user from viewing another user's order (IDOR protection)")
        void testGetOrderById_IDOR_Protection() throws Exception {
            // Why: Critical security test - prevents IDOR vulnerability
            setupEmployeeContext(); // Current user: TEST_USER_ID

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(response);

            mockMvc.perform(get("/orders/{id}", TEST_ORDER_ID))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access denied: You can only view your own orders"));

            verify(orderService).getOrderById(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should allow vendor to view orders for their vendor")
        void testGetOrderById_Vendor_Success() throws Exception {
            // Why: Vendors need access to orders placed at their stalls
            setupVendorContext(TEST_VENDOR_ID);

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(response);

            mockMvc.perform(get("/orders/{id}", TEST_ORDER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.vendorId").value(TEST_VENDOR_ID));

            verify(orderService).getOrderById(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should block vendor from viewing other vendor's orders")
        void testGetOrderById_Vendor_Unauthorized() throws Exception {
            // Why: Vendors should only see their own vendor orders (business isolation)
            setupVendorContext(TEST_VENDOR_ID);

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, OTHER_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(response);

            mockMvc.perform(get("/orders/{id}", TEST_ORDER_ID))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

            verify(orderService).getOrderById(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should allow ORG_ADMIN to view any order")
        void testGetOrderById_OrgAdmin_Success() throws Exception {
            // Why: Organization admins need oversight of all orders in their org
            setupOrgAdminContext();

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(response);

            mockMvc.perform(get("/orders/{id}", TEST_ORDER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

            verify(orderService).getOrderById(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should allow SUPER_ADMIN to view any order")
        void testGetOrderById_SuperAdmin_Success() throws Exception {
            // Why: Super admins have platform-wide access
            setupSuperAdminContext();

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(response);

            mockMvc.perform(get("/orders/{id}", TEST_ORDER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

            verify(orderService).getOrderById(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should return 404 when order does not exist")
        void testGetOrderById_NotFound() throws Exception {
            // Why: Proper error handling for missing resources
            setupEmployeeContext();

            when(orderService.getOrderById(999L))
                .thenThrow(new RuntimeException("Order not found"));

            mockMvc.perform(get("/orders/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Order not found"));
        }
    }

    // ========================================
    // Test Suite: GET /orders/my-orders (getMyOrders)
    // ========================================

    @Nested
    @DisplayName("GET /orders/my-orders - Get My Orders Tests")
    class GetMyOrdersTests {

        @Test
        @DisplayName("Should return user's own orders")
        void testGetMyOrders_Success() throws Exception {
            // Why: Users should see list of their order history
            setupEmployeeContext();

            List<OrderResponse> orders = new ArrayList<>();
            orders.add(createSampleOrderResponse(1L, TEST_USER_ID, TEST_VENDOR_ID));
            orders.add(createSampleOrderResponse(2L, TEST_USER_ID, OTHER_VENDOR_ID));

            when(orderService.getUserOrders(TEST_USER_ID)).thenReturn(orders);

            mockMvc.perform(get("/orders/my-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].userId").value(TEST_USER_ID))
                .andExpect(jsonPath("$.data[1].userId").value(TEST_USER_ID));

            verify(orderService).getUserOrders(TEST_USER_ID);
        }

        @Test
        @DisplayName("Should return empty array when user has no orders")
        void testGetMyOrders_EmptyResult() throws Exception {
            // Why: Handle edge case of new users with no order history
            setupEmployeeContext();

            when(orderService.getUserOrders(TEST_USER_ID)).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/orders/my-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));

            verify(orderService).getUserOrders(TEST_USER_ID);
        }

        @Test
        @DisplayName("Should handle service exceptions")
        void testGetMyOrders_ServiceException() throws Exception {
            // Why: Ensure graceful error handling
            setupEmployeeContext();

            when(orderService.getUserOrders(TEST_USER_ID))
                .thenThrow(new RuntimeException("Database connection error"));

            mockMvc.perform(get("/orders/my-orders"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
        }
    }

    // ========================================
    // Test Suite: GET /orders/vendor/{vendorId} (getVendorOrders)
    // ========================================

    @Nested
    @DisplayName("GET /orders/vendor/{vendorId} - Get Vendor Orders Tests")
    class GetVendorOrdersTests {

        @Test
        @DisplayName("Should allow vendor to view their own orders")
        void testGetVendorOrders_Vendor_Success() throws Exception {
            // Why: Vendors need to see orders for their stall
            setupVendorContext(TEST_VENDOR_ID);

            List<OrderResponse> orders = new ArrayList<>();
            orders.add(createSampleOrderResponse(1L, 100L, TEST_VENDOR_ID));
            orders.add(createSampleOrderResponse(2L, 101L, TEST_VENDOR_ID));

            when(orderService.getVendorOrders(TEST_VENDOR_ID)).thenReturn(orders);

            mockMvc.perform(get("/orders/vendor/{vendorId}", TEST_VENDOR_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));

            verify(orderService).getVendorOrders(TEST_VENDOR_ID);
        }

        @Test
        @DisplayName("Should block vendor from viewing other vendor's orders")
        void testGetVendorOrders_Vendor_Unauthorized() throws Exception {
            // Why: Business isolation - vendors cannot spy on competitors
            setupVendorContext(TEST_VENDOR_ID);

            mockMvc.perform(get("/orders/vendor/{vendorId}", OTHER_VENDOR_ID))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access denied: You can only view your own orders"));

            verify(orderService, never()).getVendorOrders(anyLong());
        }

        @Test
        @DisplayName("Should allow ORG_ADMIN to view any vendor's orders")
        void testGetVendorOrders_OrgAdmin_Success() throws Exception {
            // Why: Admins need oversight for dispute resolution and monitoring
            setupOrgAdminContext();

            List<OrderResponse> orders = Collections.singletonList(
                createSampleOrderResponse(1L, 100L, TEST_VENDOR_ID)
            );

            when(orderService.getVendorOrders(TEST_VENDOR_ID)).thenReturn(orders);

            mockMvc.perform(get("/orders/vendor/{vendorId}", TEST_VENDOR_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

            verify(orderService).getVendorOrders(TEST_VENDOR_ID);
        }

        @Test
        @DisplayName("Should allow SUPER_ADMIN to view any vendor's orders")
        void testGetVendorOrders_SuperAdmin_Success() throws Exception {
            // Why: Platform admins have full access
            setupSuperAdminContext();

            List<OrderResponse> orders = Collections.singletonList(
                createSampleOrderResponse(1L, 100L, TEST_VENDOR_ID)
            );

            when(orderService.getVendorOrders(TEST_VENDOR_ID)).thenReturn(orders);

            mockMvc.perform(get("/orders/vendor/{vendorId}", TEST_VENDOR_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

            verify(orderService).getVendorOrders(TEST_VENDOR_ID);
        }

        @Test
        @DisplayName("Should block regular employee from viewing vendor orders")
        void testGetVendorOrders_Employee_Forbidden() throws Exception {
            // Why: Employees should not access vendor business data
            setupEmployeeContext();

            mockMvc.perform(get("/orders/vendor/{vendorId}", TEST_VENDOR_ID))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

            verify(orderService, never()).getVendorOrders(anyLong());
        }
    }

    // ========================================
    // Test Suite: PUT /orders/{id}/status (updateOrderStatus)
    // ========================================

    @Nested
    @DisplayName("PUT /orders/{id}/status - Update Order Status Tests")
    class UpdateOrderStatusTests {

        @Test
        @DisplayName("Should allow vendor to update order status")
        void testUpdateOrderStatus_Vendor_Success() throws Exception {
            // Why: Vendors need to update order status (PREPARING, READY, etc.)
            setupVendorContext(TEST_VENDOR_ID);

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);
            response.setStatus("PREPARING");

            when(orderService.updateOrderStatus(
                eq(TEST_ORDER_ID),
                eq("PREPARING"),
                eq(TEST_VENDOR_ID),
                eq("ROLE_VENDOR"),
                eq("Starting preparation")
            )).thenReturn(response);

            mockMvc.perform(put("/orders/{id}/status", TEST_ORDER_ID)
                    .param("status", "PREPARING")
                    .param("remarks", "Starting preparation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PREPARING"));

            verify(orderService).updateOrderStatus(
                TEST_ORDER_ID,
                "PREPARING",
                TEST_VENDOR_ID,
                "ROLE_VENDOR",
                "Starting preparation"
            );
        }

        @Test
        @DisplayName("Should work without remarks parameter")
        void testUpdateOrderStatus_NoRemarks() throws Exception {
            // Why: Remarks are optional, test optional parameter handling
            setupVendorContext(TEST_VENDOR_ID);

            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);
            response.setStatus("READY");

            when(orderService.updateOrderStatus(
                eq(TEST_ORDER_ID),
                eq("READY"),
                eq(TEST_VENDOR_ID),
                eq("ROLE_VENDOR"),
                isNull()
            )).thenReturn(response);

            mockMvc.perform(put("/orders/{id}/status", TEST_ORDER_ID)
                    .param("status", "READY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

            verify(orderService).updateOrderStatus(
                TEST_ORDER_ID,
                "READY",
                TEST_VENDOR_ID,
                "ROLE_VENDOR",
                null
            );
        }

        @Test
        @DisplayName("Should block non-vendor from updating order status")
        void testUpdateOrderStatus_NonVendor_Forbidden() throws Exception {
            // Why: @RequireRole(ROLE_VENDOR) should be enforced by aspect
            setupEmployeeContext();

            mockMvc.perform(put("/orders/{id}/status", TEST_ORDER_ID)
                    .param("status", "PREPARING"))
                .andExpect(status().isInternalServerError()); // Aspect throws RuntimeException

            verify(orderService, never()).updateOrderStatus(anyLong(), anyString(), anyLong(), anyString(), anyString());
        }

        @Test
        @DisplayName("Should handle invalid status gracefully")
        void testUpdateOrderStatus_InvalidStatus() throws Exception {
            // Why: Service should validate status transitions
            setupVendorContext(TEST_VENDOR_ID);

            when(orderService.updateOrderStatus(
                anyLong(),
                eq("INVALID_STATUS"),
                anyLong(),
                anyString(),
                isNull()
            )).thenThrow(new RuntimeException("Invalid order status"));

            mockMvc.perform(put("/orders/{id}/status", TEST_ORDER_ID)
                    .param("status", "INVALID_STATUS"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid order status"));
        }
    }

    // ========================================
    // Test Suite: POST /orders/{id}/rate (rateOrder)
    // ========================================

    @Nested
    @DisplayName("POST /orders/{id}/rate - Rate Order Tests")
    class RateOrderTests {

        @Test
        @DisplayName("Should successfully rate order with valid rating (1-5)")
        void testRateOrder_Success() throws Exception {
            // Why: Users can provide feedback on completed orders
            setupEmployeeContext();

            RateOrderRequest request = new RateOrderRequest(5, "Excellent food!");
            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);
            response.setRating(5);
            response.setFeedback("Excellent food!");

            when(orderService.rateOrder(eq(TEST_ORDER_ID), any(RateOrderRequest.class), eq(TEST_USER_ID)))
                .thenReturn(response);

            mockMvc.perform(post("/orders/{id}/rate", TEST_ORDER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rating").value(5))
                .andExpect(jsonPath("$.data.feedback").value("Excellent food!"));

            verify(orderService).rateOrder(eq(TEST_ORDER_ID), any(RateOrderRequest.class), eq(TEST_USER_ID));
        }

        @Test
        @DisplayName("Should accept minimum valid rating (1)")
        void testRateOrder_MinimumRating() throws Exception {
            // Why: Test boundary condition - rating of 1 is valid
            setupEmployeeContext();

            RateOrderRequest request = new RateOrderRequest(1, "Poor service");
            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);
            response.setRating(1);

            when(orderService.rateOrder(eq(TEST_ORDER_ID), any(RateOrderRequest.class), eq(TEST_USER_ID)))
                .thenReturn(response);

            mockMvc.perform(post("/orders/{id}/rate", TEST_ORDER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("Should reject rating below 1")
        void testRateOrder_RatingTooLow() throws Exception {
            // Why: Validation must enforce minimum rating of 1
            setupEmployeeContext();

            RateOrderRequest request = new RateOrderRequest(0, "Invalid rating");

            mockMvc.perform(post("/orders/{id}/rate", TEST_ORDER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Rating must be between 1 and 5"));

            verify(orderService, never()).rateOrder(anyLong(), any(), anyLong());
        }

        @Test
        @DisplayName("Should reject rating above 5")
        void testRateOrder_RatingTooHigh() throws Exception {
            // Why: Validation must enforce maximum rating of 5
            setupEmployeeContext();

            RateOrderRequest request = new RateOrderRequest(6, "Invalid rating");

            mockMvc.perform(post("/orders/{id}/rate", TEST_ORDER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Rating must be between 1 and 5"));

            verify(orderService, never()).rateOrder(anyLong(), any(), anyLong());
        }

        @Test
        @DisplayName("Should reject null rating")
        void testRateOrder_NullRating() throws Exception {
            // Why: Rating is mandatory, null should be rejected
            setupEmployeeContext();

            RateOrderRequest request = new RateOrderRequest(null, "No rating provided");

            mockMvc.perform(post("/orders/{id}/rate", TEST_ORDER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Rating must be between 1 and 5"));

            verify(orderService, never()).rateOrder(anyLong(), any(), anyLong());
        }

        @Test
        @DisplayName("Should handle already rated order")
        void testRateOrder_AlreadyRated() throws Exception {
            // Why: Business logic may prevent duplicate ratings
            setupEmployeeContext();

            RateOrderRequest request = new RateOrderRequest(4, "Good");

            when(orderService.rateOrder(eq(TEST_ORDER_ID), any(RateOrderRequest.class), eq(TEST_USER_ID)))
                .thenThrow(new RuntimeException("Order already rated"));

            mockMvc.perform(post("/orders/{id}/rate", TEST_ORDER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Order already rated"));
        }
    }

    // ========================================
    // Test Suite: GET /orders/{id}/history (getOrderHistory)
    // ========================================

    @Nested
    @DisplayName("GET /orders/{id}/history - Get Order History Tests")
    class GetOrderHistoryTests {

        @Test
        @DisplayName("Should allow order owner to view history")
        void testGetOrderHistory_Owner_Success() throws Exception {
            // Why: Users can track status changes of their orders
            setupEmployeeContext();

            OrderResponse orderResponse = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(orderResponse);

            List<OrderStatusHistoryResponse> history = new ArrayList<>();
            OrderStatusHistoryResponse historyEntry = new OrderStatusHistoryResponse();
            historyEntry.setNewStatus("PENDING");
            historyEntry.setPreviousStatus("CREATED");
            historyEntry.setCreatedAt(LocalDateTime.now());
            history.add(historyEntry);

            when(orderService.getOrderHistory(TEST_ORDER_ID)).thenReturn(history);

            mockMvc.perform(get("/orders/{id}/history", TEST_ORDER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1));

            verify(orderService).getOrderById(TEST_ORDER_ID);
            verify(orderService).getOrderHistory(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should block non-owner from viewing order history (IDOR protection)")
        void testGetOrderHistory_IDOR_Protection() throws Exception {
            // Why: Critical security - prevent unauthorized access to order history
            setupEmployeeContext(); // Current user: TEST_USER_ID

            OrderResponse orderResponse = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(orderResponse);

            mockMvc.perform(get("/orders/{id}/history", TEST_ORDER_ID))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access denied: You can only view your own order history"));

            verify(orderService).getOrderById(TEST_ORDER_ID);
            verify(orderService, never()).getOrderHistory(anyLong());
        }

        @Test
        @DisplayName("Should allow vendor to view order history for their orders")
        void testGetOrderHistory_Vendor_Success() throws Exception {
            // Why: Vendors need to track status changes for orders they're fulfilling
            setupVendorContext(TEST_VENDOR_ID);

            OrderResponse orderResponse = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(orderResponse);

            List<OrderStatusHistoryResponse> history = Collections.emptyList();
            when(orderService.getOrderHistory(TEST_ORDER_ID)).thenReturn(history);

            mockMvc.perform(get("/orders/{id}/history", TEST_ORDER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

            verify(orderService).getOrderHistory(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should allow admin to view any order history")
        void testGetOrderHistory_Admin_Success() throws Exception {
            // Why: Admins need access for dispute resolution and monitoring
            setupOrgAdminContext();

            OrderResponse orderResponse = createSampleOrderResponse(TEST_ORDER_ID, OTHER_USER_ID, TEST_VENDOR_ID);
            when(orderService.getOrderById(TEST_ORDER_ID)).thenReturn(orderResponse);

            List<OrderStatusHistoryResponse> history = Collections.emptyList();
            when(orderService.getOrderHistory(TEST_ORDER_ID)).thenReturn(history);

            mockMvc.perform(get("/orders/{id}/history", TEST_ORDER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

            verify(orderService).getOrderHistory(TEST_ORDER_ID);
        }

        @Test
        @DisplayName("Should return 404 when order does not exist")
        void testGetOrderHistory_OrderNotFound() throws Exception {
            // Why: Proper error handling for missing resources
            setupEmployeeContext();

            when(orderService.getOrderById(999L))
                .thenThrow(new RuntimeException("Order not found"));

            mockMvc.perform(get("/orders/{id}/history", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

            verify(orderService, never()).getOrderHistory(anyLong());
        }
    }

    // ========================================
    // Test Suite: GET /orders/qr/{qrCodeData} (getOrderByQRCode)
    // ========================================

    @Nested
    @DisplayName("GET /orders/qr/{qrCodeData} - Get Order By QR Code Tests")
    class GetOrderByQRCodeTests {

        @Test
        @DisplayName("Should retrieve order by valid QR code")
        void testGetOrderByQRCode_Success() throws Exception {
            // Why: QR code is used for order pickup verification
            setupEmployeeContext();

            String qrCodeData = "QR123456789";
            OrderResponse response = createSampleOrderResponse(TEST_ORDER_ID, TEST_USER_ID, TEST_VENDOR_ID);
            response.setQrCodeData(qrCodeData);

            when(orderService.getOrderByQRCode(qrCodeData)).thenReturn(response);

            mockMvc.perform(get("/orders/qr/{qrCodeData}", qrCodeData))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.qrCodeData").value(qrCodeData));

            verify(orderService).getOrderByQRCode(qrCodeData);
        }

        @Test
        @DisplayName("Should return 404 for invalid QR code")
        void testGetOrderByQRCode_NotFound() throws Exception {
            // Why: Handle case where QR code doesn't match any order
            setupEmployeeContext();

            String invalidQR = "INVALID_QR";
            when(orderService.getOrderByQRCode(invalidQR))
                .thenThrow(new RuntimeException("Order not found"));

            mockMvc.perform(get("/orders/qr/{qrCodeData}", invalidQR))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
        }
    }

    // ========================================
    // Test Suite: GET /orders/vendor/{vendorId}/rating (getVendorRating)
    // ========================================

    @Nested
    @DisplayName("GET /orders/vendor/{vendorId}/rating - Get Vendor Rating Tests")
    class GetVendorRatingTests {

        @Test
        @DisplayName("Should retrieve vendor average rating")
        void testGetVendorRating_Success() throws Exception {
            // Why: Public endpoint for displaying vendor ratings to users
            setupEmployeeContext();

            Double avgRating = 4.5;
            when(orderService.getVendorAverageRating(TEST_VENDOR_ID)).thenReturn(avgRating);

            mockMvc.perform(get("/orders/vendor/{vendorId}/rating", TEST_VENDOR_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(4.5));

            verify(orderService).getVendorAverageRating(TEST_VENDOR_ID);
        }

        @Test
        @DisplayName("Should handle vendor with no ratings")
        void testGetVendorRating_NoRatings() throws Exception {
            // Why: New vendors may not have ratings yet
            setupEmployeeContext();

            when(orderService.getVendorAverageRating(TEST_VENDOR_ID)).thenReturn(0.0);

            mockMvc.perform(get("/orders/vendor/{vendorId}/rating", TEST_VENDOR_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(0.0));
        }

        @Test
        @DisplayName("Should handle service exceptions")
        void testGetVendorRating_ServiceException() throws Exception {
            // Why: Graceful error handling
            setupEmployeeContext();

            when(orderService.getVendorAverageRating(TEST_VENDOR_ID))
                .thenThrow(new RuntimeException("Database error"));

            mockMvc.perform(get("/orders/vendor/{vendorId}/rating", TEST_VENDOR_ID))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
        }
    }

    // ========================================
    // Additional Edge Case Tests
    // ========================================

    @Nested
    @DisplayName("Edge Case Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle missing UserContext gracefully")
        void testMissingUserContext() throws Exception {
            // Why: Ensure proper error handling when authentication is missing
            // UserContext not set

            mockMvc.perform(get("/orders/my-orders"))
                .andExpect(status().isInternalServerError()); // Controller will throw NullPointerException
        }

        @Test
        @DisplayName("Should validate @RequireRole annotation on updateOrderStatus")
        void testRequireRoleAnnotation_Enforced() throws Exception {
            // Why: Verify that @RequireRole aspect is properly intercepting calls
            setupEmployeeContext(); // Not ROLE_VENDOR

            // Should be blocked by RoleCheckAspect before reaching controller
            mockMvc.perform(put("/orders/{id}/status", TEST_ORDER_ID)
                    .param("status", "PREPARING"))
                .andExpect(status().isInternalServerError()); // Aspect throws RuntimeException

            verify(orderService, never()).updateOrderStatus(anyLong(), anyString(), anyLong(), anyString(), anyString());
        }
    }
}
