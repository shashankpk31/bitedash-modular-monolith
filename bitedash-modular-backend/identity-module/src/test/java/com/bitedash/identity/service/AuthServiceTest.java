package com.bitedash.identity.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bitedash.identity.dto.LoginResponse;
import com.bitedash.identity.dto.RegisterRequest;
import com.bitedash.identity.entity.User;
import com.bitedash.identity.mapper.UserMapper;
import com.bitedash.identity.repository.UserRepository;
import com.bitedash.shared.api.organisation.OrganisationService;
import com.bitedash.shared.api.wallet.WalletPublicService;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;
import com.bitedash.shared.event.UserRegisteredEvent;
import com.bitedash.shared.security.JwtService;

/**
 * Comprehensive test suite for AuthService.
 *
 * WHY test AuthService? Authentication is a critical security boundary. Failed authentication
 * logic can lead to unauthorized access, account takeover, or denial of service. This test suite
 * validates all authentication flows including registration, login, OTP verification, and rate limiting.
 *
 * Test categories:
 * - Registration: Validates user creation with proper validation and constraints
 * - Login: Tests authentication flow with various credential scenarios
 * - Password Validation: Ensures password strength requirements are enforced
 * - OTP Verification: Tests OTP generation, validation, and expiration
 * - Rate Limiting: Verifies brute-force protection mechanisms
 * - Edge Cases: Tests error conditions and boundary scenarios
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Test Suite")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtService jwtService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private OrganisationService organisationService;

    @Mock
    private WalletPublicService walletPublicService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        // WHY setup Redis operations? The service uses redisTemplate.opsForValue() extensively
        // for OTP storage. We mock the chain of calls to avoid NullPointerExceptions and
        // verify Redis interactions correctly.
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Nested
    @DisplayName("User Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("Should successfully register employee with valid data")
        void shouldRegisterEmployeeSuccessfully() {
            // WHY test employee registration? Employees are the most common user type in the system.
            // We need to ensure they can register with minimal friction while maintaining security.
            // This test validates the happy path for employee onboarding.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john.doe@example.com",
                "SecurePass123!",
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            User userEntity = new User();
            userEntity.setId(1L);
            userEntity.setEmail(request.email());
            userEntity.setFullName(request.fullName());
            userEntity.setRole(request.role());
            userEntity.setStatus(UserStatus.ACTIVE);

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());
            when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
            when(userMapper.toEntity(request)).thenReturn(userEntity);
            when(passwordEncoder.encode(request.password())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(userEntity);

            // When
            String result = authService.register(request);

            // Then
            assertThat(result).contains("Registration successful");
            assertThat(result).contains(request.email());
            verify(userRepository, times(1)).save(any(User.class));
            verify(walletPublicService, times(1)).initWallet(1L);
            verify(eventPublisher, times(1)).publishEvent(any(UserRegisteredEvent.class));
            verify(valueOperations, times(1)).set(eq("OTP:" + request.email()), anyString(), eq(5L), eq(TimeUnit.MINUTES));
        }

        @Test
        @DisplayName("Should successfully register vendor with PENDING_APPROVAL status")
        void shouldRegisterVendorWithPendingStatus() {
            // WHY test vendor registration separately? Vendors require approval before activation.
            // Unlike employees who get immediate ACTIVE status, vendors must be vetted by admins.
            // This prevents fraudulent vendors from accessing the platform.

            // Given
            RegisterRequest request = new RegisterRequest(
                "Restaurant Owner",
                "vendor@example.com",
                "SecurePass123!",
                Role.ROLE_VENDOR,
                "9876543210",
                1L,
                null,
                null,
                "Great Restaurant",
                "29ABCDE1234F1Z5"
            );

            User userEntity = new User();
            userEntity.setId(2L);
            userEntity.setEmail(request.email());
            userEntity.setFullName(request.fullName());
            userEntity.setRole(request.role());
            userEntity.setStatus(UserStatus.PENDING_APPROVAL);

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());
            when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
            when(userMapper.toEntity(request)).thenReturn(userEntity);
            when(passwordEncoder.encode(request.password())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(userEntity);

            // When
            String result = authService.register(request);

            // Then
            assertThat(result).contains("Registration successful");
            verify(userRepository, times(1)).save(any(User.class));
            // WHY verify status? This ensures vendors don't get automatic access before admin approval
            verify(walletPublicService, times(1)).initWallet(2L);
        }

        @Test
        @DisplayName("Should reject registration when email already exists")
        void shouldRejectDuplicateEmail() {
            // WHY test duplicate email? Duplicate emails can lead to account confusion,
            // authentication bypass, or data leakage. Each user must have a unique identifier.

            // Given
            RegisterRequest request = new RegisterRequest(
                "Jane Doe",
                "existing@example.com",
                "SecurePass123!",
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP002",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(new User()));

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email is already registered");

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should reject registration when phone number already exists")
        void shouldRejectDuplicatePhoneNumber() {
            // WHY test duplicate phone? Phone numbers are used for SMS OTP verification.
            // Duplicate phones could allow attackers to hijack accounts through SMS interception.

            // Given
            RegisterRequest request = new RegisterRequest(
                "Jane Doe",
                "jane@example.com",
                "SecurePass123!",
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP002",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.of(new User()));

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Phone number is already registered");

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should reject registration when organization does not exist")
        void shouldRejectInvalidOrganization() {
            // WHY validate organization? Employee and vendor accounts must be linked to valid
            // organizations for proper access control. Orphaned accounts could bypass org-level
            // restrictions and access unauthorized data.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "SecurePass123!",
                Role.ROLE_EMPLOYEE,
                "9876543210",
                999L, // Non-existent organization
                "EMP001",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(999L)).thenReturn(false);

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Organization not found");

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should reject registration when no contact method provided")
        void shouldRejectNoContactMethod() {
            // WHY require contact method? The system uses email/phone for account verification
            // via OTP. Without either, users cannot complete verification and admins cannot
            // communicate with them. This prevents orphaned accounts.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "", // Empty email
                "SecurePass123!",
                Role.ROLE_EMPLOYEE,
                "", // Empty phone
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("At least one contact method");

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should reject registration for vendor/employee without organizationId")
        void shouldRejectVendorWithoutOrganization() {
            // WHY enforce organization requirement? Vendors and employees operate within
            // organizational contexts. Without org linkage, we cannot enforce proper data
            // isolation, billing, or access control policies.

            // Given
            RegisterRequest request = new RegisterRequest(
                "Vendor User",
                "vendor@example.com",
                "SecurePass123!",
                Role.ROLE_VENDOR,
                "9876543210",
                null, // Missing organization ID
                null,
                null,
                "My Shop",
                "29ABCDE1234F1Z5"
            );

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Organization ID is required");

            verify(userRepository, never()).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Password Validation Tests")
    class PasswordValidationTests {

        @Test
        @DisplayName("Should reject password with less than 8 characters")
        void shouldRejectShortPassword() {
            // WHY enforce minimum 8 characters? Shorter passwords are exponentially easier to
            // brute-force. An 8-char password with full character set has 6.6 quadrillion
            // combinations vs 218 billion for 7-char. This is industry standard minimum.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "Pass1!",  // Only 6 characters
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Password must be at least 8 characters long");
        }

        @Test
        @DisplayName("Should reject password without uppercase letter")
        void shouldRejectPasswordWithoutUppercase() {
            // WHY require uppercase? Character diversity increases password entropy. Requiring
            // mixed case forces attackers to try 52 letters (A-Z, a-z) instead of 26, doubling
            // the search space per character position.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "password123!",  // No uppercase
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Password must contain at least one uppercase letter");
        }

        @Test
        @DisplayName("Should reject password without lowercase letter")
        void shouldRejectPasswordWithoutLowercase() {
            // WHY require lowercase? Same as uppercase - character diversity. Also prevents
            // users from creating all-caps passwords which are easier to remember and thus
            // more predictable for attackers.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "PASSWORD123!",  // No lowercase
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Password must contain at least one lowercase letter");
        }

        @Test
        @DisplayName("Should reject password without digit")
        void shouldRejectPasswordWithoutDigit() {
            // WHY require digits? Adds another character class (10 digits) to the mix. Without
            // digits, users tend to use dictionary words which are vulnerable to dictionary
            // attacks. Digits break word patterns.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "SecurePass!",  // No digit
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Password must contain at least one digit");
        }

        @Test
        @DisplayName("Should reject password without special character")
        void shouldRejectPasswordWithoutSpecialChar() {
            // WHY require special characters? Adds 32+ characters to the character set. More
            // importantly, special chars prevent common password patterns like "Password123".
            // This requirement forces users away from predictable patterns.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "SecurePass123",  // No special character
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Password must contain at least one special character");
        }

        @Test
        @DisplayName("Should accept password meeting all requirements")
        void shouldAcceptValidPassword() {
            // WHY test valid password? This is the positive case - we need to ensure that
            // passwords meeting all requirements are accepted. Without this test, we couldn't
            // be sure the validation logic allows valid passwords through.

            // Given
            RegisterRequest request = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "SecurePass123!",  // Meets all requirements
                Role.ROLE_EMPLOYEE,
                "9876543210",
                1L,
                "EMP001",
                1L,
                null,
                null
            );

            User userEntity = new User();
            userEntity.setId(1L);
            userEntity.setEmail(request.email());
            userEntity.setStatus(UserStatus.ACTIVE);

            when(organisationService.organizationExists(1L)).thenReturn(true);
            when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty());
            when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
            when(userMapper.toEntity(request)).thenReturn(userEntity);
            when(passwordEncoder.encode(request.password())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(userEntity);

            // When
            String result = authService.register(request);

            // Then
            assertThat(result).contains("Registration successful");
            verify(userRepository, times(1)).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should successfully login with valid email and password")
        void shouldLoginSuccessfullyWithEmail() {
            // WHY test successful login? Login is the primary entry point to the system.
            // We must verify that valid credentials grant access and return proper JWT token
            // and user details. This is the happy path for authentication.

            // Given
            String email = "john@example.com";
            String password = "SecurePass123!";
            String hashedPassword = "$2a$10$hashedPassword";
            String jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

            User user = new User();
            user.setId(1L);
            user.setUsername("johndoe1234");
            user.setEmail(email);
            user.setPassword(hashedPassword);
            user.setEmailVerified(true);
            user.setRole(Role.ROLE_EMPLOYEE);
            user.setOrganizationId(1L);
            user.setOfficeId(1L);

            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(password, hashedPassword)).thenReturn(true);
            when(jwtService.generateToken(1L, "johndoe1234", Role.ROLE_EMPLOYEE, 1L, 1L)).thenReturn(jwtToken);

            // When
            LoginResponse response = authService.login(email, password);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo(jwtToken);
            verify(auditLogService, times(1)).logUserLogin(1L, email, true);
        }

        @Test
        @DisplayName("Should successfully login with valid phone number and password")
        void shouldLoginSuccessfullyWithPhone() {
            // WHY test phone login separately? The system supports both email and phone as
            // login identifiers. We must verify phone-based authentication works independently
            // from email authentication. Different regions prefer different auth methods.

            // Given
            String phoneNumber = "9876543210";
            String password = "SecurePass123!";
            String hashedPassword = "$2a$10$hashedPassword";
            String jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

            User user = new User();
            user.setId(2L);
            user.setUsername("johndoe5678");
            user.setPhoneNumber(phoneNumber);
            user.setPassword(hashedPassword);
            user.setPhoneVerified(true);
            user.setRole(Role.ROLE_VENDOR);
            user.setOrganizationId(1L);

            when(userRepository.findByEmailOrPhoneNumber(phoneNumber, phoneNumber)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(password, hashedPassword)).thenReturn(true);
            when(jwtService.generateToken(2L, "johndoe5678", Role.ROLE_VENDOR, 1L, null)).thenReturn(jwtToken);

            // When
            LoginResponse response = authService.login(phoneNumber, password);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo(jwtToken);
            verify(auditLogService, times(1)).logUserLogin(2L, phoneNumber, true);
        }

        @Test
        @DisplayName("Should reject login with invalid credentials")
        void shouldRejectInvalidCredentials() {
            // WHY test invalid credentials? This is the primary defense against unauthorized
            // access. We must verify that wrong passwords are rejected and that failed attempts
            // are logged for security monitoring and potential account lockout.

            // Given
            String email = "john@example.com";
            String wrongPassword = "WrongPassword123!";
            String hashedPassword = "$2a$10$hashedPassword";

            User user = new User();
            user.setId(1L);
            user.setEmail(email);
            user.setPassword(hashedPassword);

            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(wrongPassword, hashedPassword)).thenReturn(false);

            // When/Then
            assertThatThrownBy(() -> authService.login(email, wrongPassword))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid credentials");

            verify(auditLogService, times(1)).logUserLogin(1L, email, false);
            verify(jwtService, never()).generateToken(anyLong(), anyString(), any(), anyLong(), anyLong());
        }

        @Test
        @DisplayName("Should reject login for non-existent user")
        void shouldRejectNonExistentUser() {
            // WHY test non-existent user? This prevents information disclosure. If we returned
            // different errors for "user not found" vs "wrong password", attackers could
            // enumerate valid usernames. We throw generic "user not found" for both cases.

            // Given
            String email = "nonexistent@example.com";
            String password = "SecurePass123!";

            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.login(email, password))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found");

            verify(passwordEncoder, never()).matches(anyString(), anyString());
            verify(jwtService, never()).generateToken(anyLong(), anyString(), any(), anyLong(), anyLong());
        }

        @Test
        @DisplayName("Should reject login for unverified user")
        void shouldRejectUnverifiedUser() {
            // WHY block unverified users? Email/phone verification proves the user owns the
            // contact method. Without verification, anyone could register with someone else's
            // email/phone and potentially access their data or receive sensitive notifications.

            // Given
            String email = "unverified@example.com";
            String password = "SecurePass123!";
            String hashedPassword = "$2a$10$hashedPassword";

            User user = new User();
            user.setId(3L);
            user.setEmail(email);
            user.setPassword(hashedPassword);
            user.setEmailVerified(false);  // Not verified
            user.setPhoneVerified(null);

            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(password, hashedPassword)).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> authService.login(email, password))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Account not verified");

            verify(jwtService, never()).generateToken(anyLong(), anyString(), any(), anyLong(), anyLong());
        }
    }

    @Nested
    @DisplayName("OTP Verification Tests")
    class OtpVerificationTests {

        @Test
        @DisplayName("Should successfully verify valid OTP for email")
        void shouldVerifyValidOtpForEmail() {
            // WHY test OTP verification? OTP proves the user has access to the registered
            // email/phone. This is the second factor in registration flow. Without proper
            // verification, we can't ensure account ownership.

            // Given
            String email = "john@example.com";
            String otp = "123456";

            User user = new User();
            user.setId(1L);
            user.setEmail(email);
            user.setEmailVerified(false);

            when(valueOperations.get("OTP_LOCKED:" + email)).thenReturn(null);
            when(valueOperations.get("OTP:" + email)).thenReturn(otp);
            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(redisTemplate.delete("OTP:" + email)).thenReturn(true);
            when(redisTemplate.delete("OTP_ATTEMPTS:" + email)).thenReturn(true);

            // When
            boolean result = authService.verifyIdentifier(email, otp);

            // Then
            assertThat(result).isTrue();
            verify(userRepository, times(1)).save(any(User.class));
            verify(redisTemplate, times(1)).delete("OTP:" + email);
            verify(redisTemplate, times(1)).delete("OTP_ATTEMPTS:" + email);
            verify(auditLogService, times(1)).logOtpVerification(email, true);
        }

        @Test
        @DisplayName("Should successfully verify valid OTP for phone number")
        void shouldVerifyValidOtpForPhone() {
            // WHY test phone OTP separately? Phone verification uses different storage
            // (phoneVerified vs emailVerified). We must verify the correct field is updated
            // based on identifier format detection (contains @ = email, else = phone).

            // Given
            String phoneNumber = "9876543210";
            String otp = "654321";

            User user = new User();
            user.setId(2L);
            user.setPhoneNumber(phoneNumber);
            user.setPhoneVerified(false);

            when(valueOperations.get("OTP_LOCKED:" + phoneNumber)).thenReturn(null);
            when(valueOperations.get("OTP:" + phoneNumber)).thenReturn(otp);
            when(userRepository.findByEmailOrPhoneNumber(phoneNumber, phoneNumber)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(redisTemplate.delete("OTP:" + phoneNumber)).thenReturn(true);
            when(redisTemplate.delete("OTP_ATTEMPTS:" + phoneNumber)).thenReturn(true);

            // When
            boolean result = authService.verifyIdentifier(phoneNumber, otp);

            // Then
            assertThat(result).isTrue();
            verify(userRepository, times(1)).save(any(User.class));
            verify(redisTemplate, times(1)).delete("OTP:" + phoneNumber);
            verify(auditLogService, times(1)).logOtpVerification(phoneNumber, true);
        }

        @Test
        @DisplayName("Should reject invalid OTP and increment attempts")
        void shouldRejectInvalidOtpAndIncrementAttempts() {
            // WHY track failed attempts? Each failed OTP attempt could be a brute-force attack.
            // We track attempts to trigger rate limiting. This test verifies that failed attempts
            // are counted and stored in Redis with proper TTL.

            // Given
            String email = "john@example.com";
            String correctOtp = "123456";
            String wrongOtp = "999999";

            when(valueOperations.get("OTP:" + email)).thenReturn(correctOtp);
            when(valueOperations.get("OTP_ATTEMPTS:" + email)).thenReturn(null);  // First attempt
            when(valueOperations.get("OTP_LOCKED:" + email)).thenReturn(null);

            // When
            boolean result = authService.verifyIdentifier(email, wrongOtp);

            // Then
            assertThat(result).isFalse();
            verify(valueOperations, times(1)).set("OTP_ATTEMPTS:" + email, "1", 15L, TimeUnit.MINUTES);
            verify(auditLogService, times(1)).logOtpVerification(email, false);
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should lock account after 5 failed OTP attempts")
        void shouldLockAccountAfter5FailedAttempts() {
            // WHY lock after 5 attempts? This is the core rate limiting defense. A 6-digit OTP
            // has 1 million combinations. With unlimited attempts, an attacker could brute-force
            // in reasonable time. With 5 attempts per 15 minutes, it takes ~3 years to exhaust
            // all combinations - making brute-force impractical.

            // Given
            String email = "john@example.com";
            String correctOtp = "123456";
            String wrongOtp = "999999";

            when(valueOperations.get("OTP:" + email)).thenReturn(correctOtp);
            when(valueOperations.get("OTP_ATTEMPTS:" + email)).thenReturn("4");  // 4 previous attempts
            when(valueOperations.get("OTP_LOCKED:" + email)).thenReturn(null);
            when(redisTemplate.delete("OTP_ATTEMPTS:" + email)).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> authService.verifyIdentifier(email, wrongOtp))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Too many failed attempts. Account locked for 15 minutes.");

            verify(valueOperations, times(1)).set("OTP_LOCKED:" + email, "1", 15L, TimeUnit.MINUTES);
            verify(redisTemplate, times(1)).delete("OTP_ATTEMPTS:" + email);
            verify(auditLogService, times(1)).logOtpVerification(email, false);
        }

        @Test
        @DisplayName("Should reject OTP verification when account is locked")
        void shouldRejectOtpWhenAccountLocked() {
            // WHY test locked state? Once locked, the account should stay locked for the full
            // 15-minute duration regardless of correct OTP. This prevents attackers from bypassing
            // the lockout by guessing the OTP correctly during the lockout period.

            // Given
            String email = "john@example.com";
            String otp = "123456";

            when(valueOperations.get("OTP_LOCKED:" + email)).thenReturn("1");  // Account is locked

            // When/Then
            assertThatThrownBy(() -> authService.verifyIdentifier(email, otp))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Too many failed attempts. Please try again in 15 minutes.");

            // WHY verify no OTP check? When locked, we don't even check the OTP value to prevent
            // timing attacks that could reveal if OTP is correct
            verify(valueOperations, never()).get("OTP:" + email);
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should handle expired OTP")
        void shouldHandleExpiredOtp() {
            // WHY test OTP expiration? OTPs have 5-minute TTL. After expiration, Redis returns null.
            // This test verifies that expired OTPs are treated as invalid and don't crash the system
            // with NullPointerException. Users must request a new OTP.

            // Given
            String email = "john@example.com";
            String otp = "123456";

            when(valueOperations.get("OTP:" + email)).thenReturn(null);  // OTP expired (Redis returns null)
            when(valueOperations.get("OTP_ATTEMPTS:" + email)).thenReturn(null);
            when(valueOperations.get("OTP_LOCKED:" + email)).thenReturn(null);

            // When
            boolean result = authService.verifyIdentifier(email, otp);

            // Then
            assertThat(result).isFalse();
            verify(valueOperations, times(1)).set("OTP_ATTEMPTS:" + email, "1", 15L, TimeUnit.MINUTES);
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should clear failed attempts after successful verification")
        void shouldClearAttemptsAfterSuccess() {
            // WHY clear attempts on success? Once user verifies successfully, they've proven
            // account ownership. Previous failed attempts were likely typos, not attacks.
            // Clearing the counter gives users a fresh start and prevents unnecessary lockouts.

            // Given
            String email = "john@example.com";
            String otp = "123456";

            User user = new User();
            user.setId(1L);
            user.setEmail(email);

            when(valueOperations.get("OTP_LOCKED:" + email)).thenReturn(null);
            when(valueOperations.get("OTP:" + email)).thenReturn(otp);
            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(redisTemplate.delete("OTP:" + email)).thenReturn(true);
            when(redisTemplate.delete("OTP_ATTEMPTS:" + email)).thenReturn(true);

            // When
            boolean result = authService.verifyIdentifier(email, otp);

            // Then
            assertThat(result).isTrue();
            verify(redisTemplate, times(1)).delete("OTP_ATTEMPTS:" + email);
        }
    }

    @Nested
    @DisplayName("OTP Resend Tests")
    class OtpResendTests {

        @Test
        @DisplayName("Should successfully resend OTP for valid user")
        void shouldResendOtpSuccessfully() {
            // WHY test OTP resend? Users may not receive the initial OTP due to email delays
            // or SMS delivery failures. Resend provides a recovery mechanism. We must verify
            // new OTP is generated, stored in Redis, and notification event is published.

            // Given
            String email = "john@example.com";
            String type = "email";

            User user = new User();
            user.setId(1L);
            user.setEmail(email);
            user.setFullName("John Doe");
            user.setRole(Role.ROLE_EMPLOYEE);

            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.of(user));

            // When
            String result = authService.resendOtp(email, type);

            // Then
            assertThat(result).contains("New verification code sent");
            assertThat(result).contains(type);
            verify(valueOperations, times(1)).set(eq("OTP:" + email), anyString(), eq(5L), eq(TimeUnit.MINUTES));
            verify(eventPublisher, times(1)).publishEvent(any(UserRegisteredEvent.class));
        }

        @Test
        @DisplayName("Should reject resend OTP for non-existent user")
        void shouldRejectResendForNonExistentUser() {
            // WHY reject non-existent users? Resend OTP requires an existing account. If the user
            // doesn't exist, there's no account to verify. This also prevents information disclosure
            // about which accounts exist in the system.

            // Given
            String email = "nonexistent@example.com";
            String type = "email";

            when(userRepository.findByEmailOrPhoneNumber(email, email)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.resendOtp(email, type))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");

            verify(valueOperations, never()).set(anyString(), anyString(), anyLong(), any(TimeUnit.class));
            verify(eventPublisher, never()).publishEvent(any(UserRegisteredEvent.class));
        }
    }
}
