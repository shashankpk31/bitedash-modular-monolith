package com.bitedash.identity.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bitedash.identity.dto.LoginResponse;
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
import com.bitedash.shared.event.UserRegisteredEvent;
import com.bitedash.shared.event.VendorApprovedEvent;
import com.bitedash.shared.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final ApplicationEventPublisher eventPublisher;
    private final StringRedisTemplate redisTemplate;
    private final OrganisationService organisationService;
    private final WalletPublicService walletPublicService;
    private final AuditLogService auditLogService;

    private final SecureRandom secureRandom = new SecureRandom();

    public String register(RegisterRequest request) {
        logger.info("Registering new user with fullName: {}", request.fullName());

        if ((request.email() == null || request.email().isBlank()) &&
            (request.phoneNumber() == null || request.phoneNumber().isBlank())) {
            throw new RuntimeException("At least one contact method (email or phone) is required");
        }

        // Validate password strength
        validatePassword(request.password());

        if (request.role().equals(Role.ROLE_VENDOR) || request.role().equals(Role.ROLE_EMPLOYEE)) {
            if (request.organizationId() == null) {
                throw new RuntimeException("Organization ID is required for this role");
            }

            // Validate organization exists
            if (!organisationService.organizationExists(request.organizationId())) {
                throw new RuntimeException("Organization not found with ID: " + request.organizationId());
            }
        }

        if (request.email() != null && !request.email().isBlank()) {
            if (userRepository.findByEmail(request.email()).isPresent()) {
                throw new RuntimeException("Email is already registered");
            }
        }

        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
            if (userRepository.findByPhoneNumber(request.phoneNumber()).isPresent()) {
                throw new RuntimeException("Phone number is already registered");
            }
        }

        String generatedUsername = generateUsername(request.fullName());
        logger.info("Generated username: {} for fullName: {}", generatedUsername, request.fullName());

        User userEntity = userMapper.toEntity(request);
        userEntity.setUsername(generatedUsername);

        if (request.role().equals(Role.ROLE_EMPLOYEE)) {
            userEntity.setStatus(UserStatus.ACTIVE);
        } else if (request.role().equals(Role.ROLE_VENDOR)) {
            userEntity.setStatus(UserStatus.PENDING_APPROVAL);
        } else {
            throw new RuntimeException("Unauthorized role for registration");
        }

        userEntity.setPassword(passwordEncoder.encode(request.password()));
        User savedUser = userRepository.save(userEntity);

        // Log user registration audit
        auditLogService.logUserRegistration(
            savedUser.getId(),
            savedUser.getEmail() != null ? savedUser.getEmail() : savedUser.getPhoneNumber(),
            savedUser.getRole().name()
        );

        // Initialize wallet for the new user
        try {
            walletPublicService.initWallet(savedUser.getId());
            logger.info("Wallet initialized for user: {}", savedUser.getId());
        } catch (Exception e) {
            logger.warn("Failed to initialize wallet for user {}: {}", savedUser.getId(), e.getMessage());
            // Don't fail registration if wallet initialization fails
        }

        // Publish event for OTP/notification
        String identifier = request.email() != null && !request.email().isBlank()
            ? request.email() : request.phoneNumber();
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        redisTemplate.opsForValue().set("OTP:" + identifier, otp, 5, TimeUnit.MINUTES);

        UserRegisteredEvent event = new UserRegisteredEvent(
            userEntity.getId(),
            identifier,
            userEntity.getFullName(),
            userEntity.getRole().name()
        );
        eventPublisher.publishEvent(event);

        return "Registration successful! Please verify your account using the OTP sent to " + identifier;
    }

    public LoginResponse login(String loginIdentifier, String password) {
        User existingUser = userRepository.findByEmailOrPhoneNumber(loginIdentifier, loginIdentifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            // Log failed login attempt
            auditLogService.logUserLogin(existingUser.getId(), loginIdentifier, false);
            throw new RuntimeException("Invalid credentials");
        }

        boolean verified = existingUser.getEmailVerified() != null && existingUser.getEmailVerified() ||
                           existingUser.getPhoneVerified() != null && existingUser.getPhoneVerified();

        if (!verified) {
            throw new RuntimeException("Account not verified. Please verify your email or phone number.");
        }

        String token = jwtService.generateToken(
            existingUser.getId(),
            existingUser.getUsername(),
            existingUser.getRole(),
            existingUser.getOrganizationId(),
            existingUser.getOfficeId()
        );

        // Log successful login
        auditLogService.logUserLogin(existingUser.getId(), loginIdentifier, true);

        LoginResponse response = new LoginResponse();
        response.setUser(userMapper.toResponse(existingUser));
        response.setToken(token);
        return response;
    }

    public void validateToken(String token) {
        jwtService.extractUserId(token);
    }

    public boolean verifyIdentifier(String identifier, String otp) {
        // Check rate limiting (max 5 attempts per 15 minutes)
        String attemptsKey = "OTP_ATTEMPTS:" + identifier;
        String lockedKey = "OTP_LOCKED:" + identifier;

        // Check if account is locked
        String locked = redisTemplate.opsForValue().get(lockedKey);
        if (locked != null) {
            throw new RuntimeException("Too many failed attempts. Please try again in 15 minutes.");
        }

        String storedOtp = redisTemplate.opsForValue().get("OTP:" + identifier);

        if (storedOtp != null && storedOtp.equals(otp)) {
            User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (identifier.contains("@")) {
                user.setEmailVerified(true);
            } else {
                user.setPhoneVerified(true);
            }

            userRepository.save(user);
            redisTemplate.delete("OTP:" + identifier);
            // Clear failed attempts on successful verification
            redisTemplate.delete(attemptsKey);

            // Log successful OTP verification
            auditLogService.logOtpVerification(identifier, true);
            return true;
        }

        // Log failed OTP verification
        auditLogService.logOtpVerification(identifier, false);

        // Increment failed attempts
        String attemptsStr = redisTemplate.opsForValue().get(attemptsKey);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;
        attempts++;

        if (attempts >= 5) {
            // Lock account for 15 minutes
            redisTemplate.opsForValue().set(lockedKey, "1", 15, java.util.concurrent.TimeUnit.MINUTES);
            redisTemplate.delete(attemptsKey);
            throw new RuntimeException("Too many failed attempts. Account locked for 15 minutes.");
        } else {
            // Store attempts count for 15 minutes
            redisTemplate.opsForValue().set(attemptsKey, String.valueOf(attempts), 15, java.util.concurrent.TimeUnit.MINUTES);
        }

        return false;
    }

    public String resendOtp(String identifier, String type) {
        User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        redisTemplate.opsForValue().set("OTP:" + identifier, otp, 5, TimeUnit.MINUTES);

        // Publish event for notification
        UserRegisteredEvent event = new UserRegisteredEvent(
            user.getId(),
            identifier,
            user.getFullName(),
            user.getRole().name()
        );
        eventPublisher.publishEvent(event);

        return "New verification code sent via " + type;
    }

    public String registerOrg(RegisterOrgRequest request) {
        logger.info("Registering new Org Admin with fullName: {}", request.fullName());

        if ((request.email() == null || request.email().isBlank()) &&
            (request.phoneNumber() == null || request.phoneNumber().isBlank())) {
            throw new RuntimeException("At least one contact method (email or phone) is required");
        }

        // Validate password strength
        validatePassword(request.password());

        if (request.organizationId() != null) {
            // Validate organization exists
            if (!organisationService.organizationExists(request.organizationId())) {
                throw new RuntimeException("Organization not found with ID: " + request.organizationId());
            }
        }

        if (request.email() != null && !request.email().isBlank()) {
            if (userRepository.findByEmail(request.email()).isPresent()) {
                throw new RuntimeException("Email is already registered");
            }
        }

        if (request.phoneNumber() != null && userRepository.findByPhoneNumber(request.phoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number is already registered");
        }

        String generatedUsername = generateUsername(request.fullName());
        logger.info("Generated username: {} for org admin: {}", generatedUsername, request.fullName());

        User userEntity = userMapper.toEntity(request);
        userEntity.setUsername(generatedUsername);
        userEntity.setStatus(UserStatus.ACTIVE);

        userEntity.setPassword(passwordEncoder.encode(request.password()));
        User savedUser = userRepository.save(userEntity);

        // Initialize wallet for the new org admin
        try {
            walletPublicService.initWallet(savedUser.getId());
            logger.info("Wallet initialized for org admin: {}", savedUser.getId());
        } catch (Exception e) {
            logger.warn("Failed to initialize wallet for org admin {}: {}", savedUser.getId(), e.getMessage());
            // Don't fail registration if wallet initialization fails
        }

        // Publish event for OTP/notification
        String identifier = request.email() != null && !request.email().isBlank()
            ? request.email() : request.phoneNumber();
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        redisTemplate.opsForValue().set("OTP:" + identifier, otp, 5, TimeUnit.MINUTES);

        UserRegisteredEvent event = new UserRegisteredEvent(
            userEntity.getId(),
            identifier,
            userEntity.getFullName(),
            userEntity.getRole().name()
        );
        eventPublisher.publishEvent(event);

        return "Organization admin registration successful!";
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }

        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException("Password must contain at least one uppercase letter");
        }

        if (!password.matches(".*[a-z].*")) {
            throw new RuntimeException("Password must contain at least one lowercase letter");
        }

        if (!password.matches(".*[0-9].*")) {
            throw new RuntimeException("Password must contain at least one digit");
        }

        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new RuntimeException("Password must contain at least one special character");
        }
    }

    private String generateUsername(String fullName) {
        String baseUsername = fullName.toLowerCase()
            .replaceAll("[^a-z0-9]", "");

        if (baseUsername.length() > 15) {
            baseUsername = baseUsername.substring(0, 15);
        }

        int maxAttempts = 10;
        for (int i = 0; i < maxAttempts; i++) {
            String randomSuffix = String.format("%04d", secureRandom.nextInt(10000));
            String candidateUsername = baseUsername + randomSuffix;

            if (!userRepository.findByUsername(candidateUsername).isPresent()) {
                return candidateUsername;
            }
        }

        String timestampSuffix = String.valueOf(System.currentTimeMillis() % 10000);
        return baseUsername + timestampSuffix;
    }

    public List<UserResponse> getPendingApprovals() {
        logger.info("Fetching pending user approvals");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("No authentication context found");
        }

        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> pendingUsers;

        if (currentUser.getRole() == Role.ROLE_SUPER_ADMIN) {
            logger.info("SUPER_ADMIN: Fetching ALL pending approvals (platform-wide)");
            pendingUsers = userRepository.findByStatus(UserStatus.PENDING_APPROVAL);
        } else if (currentUser.getRole() == Role.ROLE_ORG_ADMIN) {
            Long organizationId = currentUser.getOrganizationId();
            if (organizationId == null) {
                throw new RuntimeException("Organization ID not found for current user");
            }
            logger.info("ORG_ADMIN: Fetching pending approvals for organizationId: {}", organizationId);
            pendingUsers = userRepository.findByStatusAndOrganizationId(
                UserStatus.PENDING_APPROVAL,
                organizationId
            );
        } else {
            throw new RuntimeException("Unauthorized: Only SUPER_ADMIN or ORG_ADMIN can view pending approvals");
        }

        return pendingUsers.stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    public String updateUserStatus(Long userId, String status) {
        logger.info("Updating user {} status to: {}", userId, status);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("No authentication context found");
        }

        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.ROLE_ORG_ADMIN) {
            Long organizationId = currentUser.getOrganizationId();
            if (organizationId == null) {
                throw new RuntimeException("Organization ID not found for current user");
            }

            if (user.getOrganizationId() == null || !user.getOrganizationId().equals(organizationId)) {
                throw new RuntimeException("Access Denied: You can only update users from your organization");
            }
            logger.info("ORG_ADMIN: Updating user {} from organizationId: {}", userId, organizationId);
        } else if (currentUser.getRole() == Role.ROLE_SUPER_ADMIN) {
            logger.info("SUPER_ADMIN: Updating user {} (platform-wide access)", userId);
        } else {
            throw new RuntimeException("Unauthorized: Only SUPER_ADMIN or ORG_ADMIN can update user status");
        }

        UserStatus userStatus;
        try {
            userStatus = UserStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status. Valid values: ACTIVE, BLOCKED, PENDING_APPROVAL");
        }

        user.setStatus(userStatus);
        userRepository.save(user);

        // Publish event for vendor approval notification
        if (user.getRole() == Role.ROLE_VENDOR && userStatus == UserStatus.ACTIVE) {
            try {
                Long vendorId = organisationService.getVendorIdByOwnerUserId(userId);
                if (vendorId != null) {
                    String vendorName = organisationService.getVendorNameById(vendorId);
                    VendorApprovedEvent event = new VendorApprovedEvent(
                        vendorId,
                        user.getId(),
                        user.getEmail(),
                        vendorName != null ? vendorName : "Unknown Vendor",
                        user.getFullName()
                    );
                    eventPublisher.publishEvent(event);
                    logger.info("VendorApprovedEvent published for vendor {} (user {})", vendorId, userId);
                }
            } catch (Exception e) {
                logger.warn("Failed to publish VendorApprovedEvent for user {}: {}", userId, e.getMessage());
                // Don't fail the status update if event publishing fails
            }
        }

        logger.info("User {} status updated to {} successfully", userId, userStatus);
        return String.format("User status updated to %s successfully", userStatus.name());
    }
}
