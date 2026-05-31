package com.bitedash.identity.service;

import com.bitedash.identity.dto.RegisterOrgRequest;
import com.bitedash.identity.dto.RegisterRequest;
import com.bitedash.identity.dto.UserResponse;
import com.bitedash.identity.entity.User;
import com.bitedash.identity.mapper.UserMapper;
import com.bitedash.identity.repository.UserRepository;
import com.bitedash.shared.api.organisation.OrganisationService;
import com.bitedash.shared.api.wallet.WalletPublicService;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for UserServiceImpl.
 * Tests cover: User CRUD, role-based queries, organization membership, registration.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl Tests")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private OrganisationService organisationService;

    @Mock
    private WalletPublicService walletPublicService;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private UserResponse testUserResponse;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("user@example.com");
        testUser.setUsername("johndoe1234");
        testUser.setFullName("John Doe");
        testUser.setPhoneNumber("+91-9876543210");
        testUser.setRole(Role.ROLE_EMPLOYEE);
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setOrganizationId(1L);

        testUserResponse = new UserResponse();
        testUserResponse.setId(1L);
        testUserResponse.setEmail("user@example.com");
        testUserResponse.setFullName("John Doe");
    }

    @Nested
    @DisplayName("Count Methods Tests")
    class CountMethodsTests {

        @Test
        @DisplayName("Should count all users")
        void countAllUsers_ReturnsCount() {
            when(userRepository.count()).thenReturn(100L);

            Integer count = userService.countAllUsers();

            assertThat(count).isEqualTo(100);
        }

        @Test
        @DisplayName("Should count pending vendors")
        void countPendingVendors_ReturnsCount() {
            when(userRepository.countByRoleAndStatus(Role.ROLE_VENDOR, UserStatus.PENDING_APPROVAL))
                .thenReturn(5L);

            Integer count = userService.countPendingVendors();

            assertThat(count).isEqualTo(5);
        }

        @Test
        @DisplayName("Should count employees by organization")
        void countEmployeesByOrganization_ReturnsCount() {
            when(userRepository.countByOrganizationIdAndRole(1L, Role.ROLE_EMPLOYEE))
                .thenReturn(50L);

            Integer count = userService.countEmployeesByOrganization(1L);

            assertThat(count).isEqualTo(50);
        }
    }

    @Nested
    @DisplayName("Existence Check Tests")
    class ExistenceCheckTests {

        @Test
        @DisplayName("Should return true for existing email")
        void existsByEmail_ExistingEmail_ReturnsTrue() {
            when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

            boolean exists = userService.existsByEmail("user@example.com");

            assertThat(exists).isTrue();
        }

        @Test
        @DisplayName("Should return false for non-existing email")
        void existsByEmail_NonExistingEmail_ReturnsFalse() {
            when(userRepository.existsByEmail("nonexistent@example.com")).thenReturn(false);

            boolean exists = userService.existsByEmail("nonexistent@example.com");

            assertThat(exists).isFalse();
        }

        @Test
        @DisplayName("Should return true for existing username")
        void existsByUsername_ExistingUsername_ReturnsTrue() {
            when(userRepository.existsByUsername("johndoe1234")).thenReturn(true);

            boolean exists = userService.existsByUsername("johndoe1234");

            assertThat(exists).isTrue();
        }
    }

    @Nested
    @DisplayName("Organization Membership Tests")
    class OrganizationMembershipTests {

        @Test
        @DisplayName("Should return true when user belongs to organization")
        void userBelongsToOrganization_UserInOrg_ReturnsTrue() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            boolean belongs = userService.userBelongsToOrganization(1L, 1L);

            assertThat(belongs).isTrue();
        }

        @Test
        @DisplayName("Should return false when user not in organization")
        void userBelongsToOrganization_UserNotInOrg_ReturnsFalse() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser)); // User org is 1

            boolean belongs = userService.userBelongsToOrganization(1L, 2L); // Check for org 2

            assertThat(belongs).isFalse();
        }

        @Test
        @DisplayName("Should return false for non-existing user")
        void userBelongsToOrganization_NonExistingUser_ReturnsFalse() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            boolean belongs = userService.userBelongsToOrganization(999L, 1L);

            assertThat(belongs).isFalse();
        }
    }

    @Nested
    @DisplayName("Get User Properties Tests")
    class GetUserPropertiesTests {

        @Test
        @DisplayName("Should get user role")
        void getUserRole_ExistingUser_ReturnsRole() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            Role role = userService.getUserRole(1L);

            assertThat(role).isEqualTo(Role.ROLE_EMPLOYEE);
        }

        @Test
        @DisplayName("Should throw exception for non-existing user role")
        void getUserRole_NonExisting_ThrowsException() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserRole(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get user status")
        void getUserStatus_ExistingUser_ReturnsStatus() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            UserStatus status = userService.getUserStatus(1L);

            assertThat(status).isEqualTo(UserStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should get user email")
        void getUserEmail_ExistingUser_ReturnsEmail() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            String email = userService.getUserEmail(1L);

            assertThat(email).isEqualTo("user@example.com");
        }

        @Test
        @DisplayName("Should return null email for non-existing user")
        void getUserEmail_NonExisting_ReturnsNull() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            String email = userService.getUserEmail(999L);

            assertThat(email).isNull();
        }

        @Test
        @DisplayName("Should get user full name")
        void getUserFullName_ExistingUser_ReturnsName() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            String name = userService.getUserFullName(1L);

            assertThat(name).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("Should get user organization ID")
        void getUserOrgId_ExistingUser_ReturnsOrgId() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            Long orgId = userService.getUserOrgId(1L);

            assertThat(orgId).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("Get User By Identifier Tests")
    class GetUserByIdentifierTests {

        @Test
        @DisplayName("Should get user by ID")
        void getUserById_ExistingId_ReturnsUser() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(testUser)).thenReturn(testUserResponse);

            UserResponse response = userService.getUserById(1L);

            assertThat(response).isNotNull();
            assertThat(response.getEmail()).isEqualTo("user@example.com");
        }

        @Test
        @DisplayName("Should throw exception for non-existing user ID")
        void getUserById_NonExisting_ThrowsException() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get user by email")
        void getUserByEmail_ExistingEmail_ReturnsUser() {
            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(testUser)).thenReturn(testUserResponse);

            UserResponse response = userService.getUserByEmail("user@example.com");

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should get user by username")
        void getUserByUsername_ExistingUsername_ReturnsUser() {
            when(userRepository.findByUsername("johndoe1234")).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(testUser)).thenReturn(testUserResponse);

            UserResponse response = userService.getUserByUsername("johndoe1234");

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should get user by phone number")
        void getUserByPhoneNumber_ExistingPhone_ReturnsUser() {
            when(userRepository.findByPhoneNumber("+91-9876543210")).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(testUser)).thenReturn(testUserResponse);

            UserResponse response = userService.getUserByPhoneNumber("+91-9876543210");

            assertThat(response).isNotNull();
        }
    }

    @Nested
    @DisplayName("Get Users By Filter Tests")
    class GetUsersByFilterTests {

        @Test
        @DisplayName("Should get users by role")
        void getUsersByRole_ReturnsUsers() {
            User user2 = new User();
            user2.setId(2L);
            user2.setRole(Role.ROLE_EMPLOYEE);
            user2.setStatus(UserStatus.ACTIVE);

            UserResponse response2 = new UserResponse();
            response2.setId(2L);

            when(userRepository.findByRoleAndStatus(Role.ROLE_EMPLOYEE, UserStatus.ACTIVE))
                .thenReturn(Arrays.asList(testUser, user2));
            when(userMapper.toResponse(testUser)).thenReturn(testUserResponse);
            when(userMapper.toResponse(user2)).thenReturn(response2);

            List<UserResponse> users = userService.getUsersByRole(Role.ROLE_EMPLOYEE);

            assertThat(users).hasSize(2);
        }

        @Test
        @DisplayName("Should get users by organization ID")
        void getUsersByOrganizationId_ReturnsUsers() {
            when(userRepository.findByOrganizationId(1L)).thenReturn(Arrays.asList(testUser));
            when(userMapper.toResponse(testUser)).thenReturn(testUserResponse);

            List<UserResponse> users = userService.getUsersByOrganizationId(1L);

            assertThat(users).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Register Org Admin Tests")
    class RegisterOrgAdminTests {

        @Test
        @DisplayName("Should register org admin successfully")
        void registerOrgAdminDetailed_ValidRequest_RegistersAdmin() {
            RegisterOrgRequest request = new RegisterOrgRequest(
                "Jane Admin", "jane@company.com", "SecurePass123!",
                Role.ROLE_ORG_ADMIN, "+91-9876543211", 1L, "EMP001", 1L, null, null);

            User newUser = new User();
            newUser.setId(2L);
            newUser.setEmail("jane@company.com");

            UserResponse newUserResponse = new UserResponse();
            newUserResponse.setId(2L);
            newUserResponse.setEmail("jane@company.com");

            when(userRepository.findByEmail("jane@company.com")).thenReturn(Optional.empty());
            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userMapper.toEntity(request)).thenReturn(newUser);
            when(passwordEncoder.encode("SecurePass123!")).thenReturn("encoded_password");
            when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenReturn(newUser);
            when(userMapper.toResponse(newUser)).thenReturn(newUserResponse);

            UserResponse response = userService.registerOrgAdminDetailed(request);

            assertThat(response).isNotNull();
            assertThat(response.getEmail()).isEqualTo("jane@company.com");
            verify(walletPublicService).initWallet(2L);
            verify(eventPublisher).publishEvent(any());
        }

        @Test
        @DisplayName("Should reject duplicate email")
        void registerOrgAdminDetailed_DuplicateEmail_ThrowsException() {
            RegisterOrgRequest request = new RegisterOrgRequest(
                "Jane Admin", "user@example.com", "SecurePass123!",
                Role.ROLE_ORG_ADMIN, "+91-9876543211", 1L, "EMP001", 1L, null, null);

            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> userService.registerOrgAdminDetailed(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already registered");
        }

        @Test
        @DisplayName("Should reject non-existing organization")
        void registerOrgAdminDetailed_InvalidOrg_ThrowsException() {
            RegisterOrgRequest request = new RegisterOrgRequest(
                "Jane Admin", "jane@company.com", "SecurePass123!",
                Role.ROLE_ORG_ADMIN, "+91-9876543211", 999L, "EMP001", 1L, null, null);

            when(userRepository.findByEmail("jane@company.com")).thenReturn(Optional.empty());
            when(organisationService.organizationExists(999L)).thenReturn(false);

            assertThatThrownBy(() -> userService.registerOrgAdminDetailed(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Organization not found");
        }
    }

    @Nested
    @DisplayName("Register Vendor Tests")
    class RegisterVendorTests {

        @Test
        @DisplayName("Should register vendor with pending status")
        void registerVendor_ValidRequest_RegistersWithPending() {
            RegisterRequest request = new RegisterRequest(
                "Vendor User",           // fullName
                "vendor@example.com",    // email
                "VendorPass123!",        // password
                Role.ROLE_VENDOR,        // role
                null,                    // phoneNumber
                1L,                      // organizationId
                null,                    // employeeId
                null,                    // officeId
                null,                    // shopName
                null                     // gstNumber
            );

            User newVendor = new User();
            newVendor.setId(3L);
            newVendor.setEmail("vendor@example.com");
            newVendor.setStatus(UserStatus.PENDING_APPROVAL);

            UserResponse vendorResponse = new UserResponse();
            vendorResponse.setId(3L);

            when(userRepository.findByEmail("vendor@example.com")).thenReturn(Optional.empty());
            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userMapper.toEntity(request)).thenReturn(newVendor);
            when(passwordEncoder.encode("VendorPass123!")).thenReturn("encoded_password");
            when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenReturn(newVendor);
            when(userMapper.toResponse(newVendor)).thenReturn(vendorResponse);

            UserResponse response = userService.registerVendor(request);

            assertThat(response).isNotNull();
            assertThat(newVendor.getStatus()).isEqualTo(UserStatus.PENDING_APPROVAL);
            verify(walletPublicService).initWallet(3L);
        }

        @Test
        @DisplayName("Should handle wallet initialization failure gracefully")
        void registerVendor_WalletFails_StillRegisters() {
            RegisterRequest request = new RegisterRequest(
                "Vendor User",           // fullName
                "vendor@example.com",    // email
                "VendorPass123!",        // password
                Role.ROLE_VENDOR,        // role
                null,                    // phoneNumber
                1L,                      // organizationId
                null,                    // employeeId
                null,                    // officeId
                null,                    // shopName
                null                     // gstNumber
            );

            User newVendor = new User();
            newVendor.setId(3L);
            newVendor.setEmail("vendor@example.com");

            UserResponse vendorResponse = new UserResponse();
            vendorResponse.setId(3L);

            when(userRepository.findByEmail("vendor@example.com")).thenReturn(Optional.empty());
            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userMapper.toEntity(request)).thenReturn(newVendor);
            when(passwordEncoder.encode("VendorPass123!")).thenReturn("encoded_password");
            when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenReturn(newVendor);
            when(userMapper.toResponse(newVendor)).thenReturn(vendorResponse);
            doThrow(new RuntimeException("Wallet service unavailable")).when(walletPublicService).initWallet(3L);

            // Should not throw - registration continues even if wallet fails
            UserResponse response = userService.registerVendor(request);

            assertThat(response).isNotNull();
        }
    }

    @Nested
    @DisplayName("Shared Interface Registration Tests")
    class SharedInterfaceTests {

        @Test
        @DisplayName("Should register org admin via shared interface")
        void registerOrgAdmin_SharedInterface_ReturnsUserId() {
            User newUser = new User();
            newUser.setId(4L);
            newUser.setEmail("admin@corp.com");

            UserResponse response = new UserResponse();
            response.setId(4L);

            when(userRepository.findByEmail("admin@corp.com")).thenReturn(Optional.empty());
            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userMapper.toEntity(any(RegisterOrgRequest.class))).thenReturn(newUser);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenReturn(newUser);
            when(userMapper.toResponse(newUser)).thenReturn(response);

            Long userId = userService.registerOrgAdmin(
                "Admin User", "admin@corp.com", "Password123!",
                "+91-1234567890", 1L, "EMP002", 1L, null, null);

            assertThat(userId).isEqualTo(4L);
        }
    }
}
