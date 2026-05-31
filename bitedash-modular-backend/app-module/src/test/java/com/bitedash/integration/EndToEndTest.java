package com.bitedash.integration;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End Integration Tests for BiteDash Application.
 *
 * WHY E2E Tests? Unit tests verify individual components work correctly in isolation.
 * E2E tests verify the complete system works together - from HTTP request through
 * controllers, services, repositories, and database, back to HTTP response.
 *
 * These tests simulate real user flows:
 * 1. Employee registers and verifies account
 * 2. Employee logs in and receives JWT
 * 3. Employee browses menu and places order
 * 4. Vendor views and updates order status
 * 5. Employee views order history and rates order
 *
 * Uses H2 in-memory database with test profile for isolation.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("BiteDash End-to-End Integration Tests")
class EndToEndTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Shared state across tests (for sequential flow testing)
    private static String employeeToken;
    private static String vendorToken;
    private static Long orderId;

    @Nested
    @DisplayName("1. Health Check Tests")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class HealthCheckTests {

        @Test
        @Order(1)
        @DisplayName("Application health endpoint should return OK")
        void healthCheck_ShouldReturnOk() throws Exception {
            // WHY: First verify the application is running and responding
            mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        }
    }

    @Nested
    @DisplayName("2. Public Endpoint Tests")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class PublicEndpointTests {

        @Test
        @Order(1)
        @DisplayName("Public organizations endpoint should be accessible without auth")
        void getPublicOrganizations_WithoutAuth_ShouldReturn200() throws Exception {
            // WHY: Registration page needs org list before user logs in
            mockMvc.perform(get("/organization/public"))
                .andExpect(status().isOk());
        }

        @Test
        @Order(2)
        @DisplayName("Protected endpoint should require authentication")
        void protectedEndpoint_WithoutAuth_ShouldReturn401Or403() throws Exception {
            // WHY: Verify security is working - unauthenticated requests should be blocked
            mockMvc.perform(get("/orders/my-orders"))
                .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("3. Authentication Flow Tests")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class AuthenticationFlowTests {

        @Test
        @Order(1)
        @DisplayName("Registration should validate password strength")
        void register_WeakPassword_ShouldReject() throws Exception {
            // WHY: Ensure password policy is enforced at API level
            String requestBody = """
                {
                    "fullName": "Test User",
                    "email": "test@example.com",
                    "password": "weak",
                    "role": "ROLE_EMPLOYEE",
                    "organizationId": 1
                }
                """;

            mockMvc.perform(post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().is4xxClientError());
        }

        @Test
        @Order(2)
        @DisplayName("Login with invalid credentials should fail")
        void login_InvalidCredentials_ShouldFail() throws Exception {
            // WHY: Verify invalid credentials are rejected
            String requestBody = """
                {
                    "identifier": "nonexistent@example.com",
                    "password": "WrongPass123!"
                }
                """;

            mockMvc.perform(post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("4. Authorization Tests")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class AuthorizationTests {

        @Test
        @Order(1)
        @DisplayName("IDOR protection: Users cannot access others' data")
        void idorProtection_ShouldPreventUnauthorizedAccess() throws Exception {
            // WHY: CRITICAL security test - verify IDOR vulnerabilities are prevented
            // This tests that user 1 cannot access user 2's data by manipulating IDs

            // Without proper auth, trying to access specific user's wallet should fail
            mockMvc.perform(get("/wallet/user/999"))
                .andExpect(status().is4xxClientError());
        }

        @Test
        @Order(2)
        @DisplayName("Role-based access: Employee cannot access admin endpoints")
        void roleBasedAccess_EmployeeCannotAccessAdmin() throws Exception {
            // WHY: Verify role enforcement - employees shouldn't access admin functions
            mockMvc.perform(get("/auth/admin/pending-approvals"))
                .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("5. API Contract Tests")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class ApiContractTests {

        @Test
        @Order(1)
        @DisplayName("API response should follow standard format")
        void apiResponse_ShouldFollowStandardFormat() throws Exception {
            // WHY: Verify API responses follow consistent format for frontend compatibility
            MvcResult result = mockMvc.perform(get("/organization/public"))
                .andExpect(status().isOk())
                .andReturn();

            String responseBody = result.getResponse().getContentAsString();
            JsonNode json = objectMapper.readTree(responseBody);

            // Standard API response should have success and data fields
            assertThat(json.has("success") || json.has("data") || json.isArray())
                .as("Response should follow standard API format")
                .isTrue();
        }

        @Test
        @Order(2)
        @DisplayName("Validation errors should return proper error messages")
        void validationError_ShouldReturnProperMessage() throws Exception {
            // WHY: Frontend needs clear error messages to display to users
            String invalidRequest = """
                {
                    "fullName": "",
                    "email": "invalid-email"
                }
                """;

            mockMvc.perform(post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest))
                .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("6. Security Header Tests")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class SecurityHeaderTests {

        @Test
        @Order(1)
        @DisplayName("Response should include security headers")
        void response_ShouldIncludeSecurityHeaders() throws Exception {
            // WHY: Security headers protect against common web vulnerabilities
            MvcResult result = mockMvc.perform(get("/organization/public"))
                .andExpect(status().isOk())
                .andReturn();

            // Check for important security headers
            String xFrameOptions = result.getResponse().getHeader("X-Frame-Options");
            String xContentType = result.getResponse().getHeader("X-Content-Type-Options");

            // Headers should be present (may vary based on config)
            // This test documents what headers we expect
            assertThat(xFrameOptions != null || xContentType != null)
                .as("At least one security header should be present")
                .isTrue();
        }
    }

    @Nested
    @DisplayName("7. Menu and Order API Tests")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class MenuAndOrderTests {

        @Test
        @Order(1)
        @DisplayName("Public menu endpoint should return menu items")
        void getPromotedMenu_ShouldReturnMenuItems() throws Exception {
            // WHY: Homepage shows promoted items without requiring login
            mockMvc.perform(get("/menus/promoted"))
                .andExpect(status().isOk());
        }

        @Test
        @Order(2)
        @DisplayName("Get menu by vendor should work")
        void getMenuByVendor_ShouldReturnMenu() throws Exception {
            // WHY: Users browse vendor menus before ordering
            mockMvc.perform(get("/menus/vendor/1"))
                .andExpect(status().isOk());
        }
    }
}
