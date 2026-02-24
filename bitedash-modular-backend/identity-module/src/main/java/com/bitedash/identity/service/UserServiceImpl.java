package com.bitedash.identity.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bitedash.identity.dto.RegisterOrgRequest;
import com.bitedash.identity.dto.RegisterRequest;
import com.bitedash.identity.dto.UserResponse;
import com.bitedash.identity.entity.User;
import com.bitedash.identity.mapper.UserMapper;
import com.bitedash.identity.repository.UserRepository;
import com.bitedash.shared.api.identity.UserService;
import com.bitedash.shared.api.organisation.OrganisationService;
import com.bitedash.shared.api.wallet.WalletPublicService;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;
import com.bitedash.shared.event.UserRegisteredEvent;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final OrganisationService organisationService;
    private final WalletPublicService walletPublicService;

    // ===== Shared Interface Implementation =====

    @Override
    public Integer countPendingVendors() {
        return (int) userRepository.countByRoleAndStatus(Role.ROLE_VENDOR, UserStatus.PENDING_APPROVAL);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean userBelongsToOrganization(Long userId, Long organizationId) {
        return userRepository.findById(userId)
                .map(user -> organizationId.equals(user.getOrganizationId()))
                .orElse(false);
    }

    @Override
    public Role getUserRole(Long userId) {
        return userRepository.findById(userId)
                .map(User::getRole)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    @Override
    public UserStatus getUserStatus(Long userId) {
        return userRepository.findById(userId)
                .map(User::getStatus)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    @Override
    public String getUserEmail(Long userId) {
        return userRepository.findById(userId)
                .map(User::getEmail)
                .orElse(null);
    }

    @Override
    public String getUserFullName(Long userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse(null);
    }

    @Override
    public Long registerOrgAdmin(String fullName, String email, String password, String phoneNumber,
                                  Long organizationId, String employeeId, Long officeId,
                                  String shopName, String gstNumber) {
        logger.info("Registering organization admin via shared API: {}", fullName);

        RegisterOrgRequest request = new RegisterOrgRequest(
            fullName, email, password, Role.ROLE_ORG_ADMIN, phoneNumber,
            organizationId, employeeId, officeId, shopName, gstNumber
        );

        // Reuse existing logic
        UserResponse response = registerOrgAdminDetailed(request);
        return response.getId();
    }

    // ===== Helper methods for internal use (returning full DTOs) =====

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return userMapper.toResponse(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return userMapper.toResponse(user);
    }

    public UserResponse getUserByPhoneNumber(String phoneNumber) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found with phone: " + phoneNumber));
        return userMapper.toResponse(user);
    }

    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRoleAndStatus(role, UserStatus.ACTIVE)
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getUsersByOrganizationId(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId)
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse registerOrgAdminDetailed(RegisterOrgRequest request) {
        logger.info("Registering organization admin: {}", request.fullName());

        if (request.email() != null && userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        // Validate organization exists
        if (request.organizationId() != null && !organisationService.organizationExists(request.organizationId())) {
            throw new RuntimeException("Organization not found with ID: " + request.organizationId());
        }

        User user = userMapper.toEntity(request);
        user.setUsername(generateUsername(request.fullName()));
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        // Initialize wallet for the new org admin
        try {
            walletPublicService.initWallet(user.getId());
            logger.info("Wallet initialized for org admin: {}", user.getId());
        } catch (Exception e) {
            logger.warn("Failed to initialize wallet for org admin {}: {}", user.getId(), e.getMessage());
            // Don't fail registration if wallet initialization fails
        }

        // Publish event for notification
        UserRegisteredEvent event = new UserRegisteredEvent(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name()
        );
        eventPublisher.publishEvent(event);

        return userMapper.toResponse(user);
    }

    public UserResponse registerVendor(RegisterRequest request) {
        logger.info("Registering vendor: {}", request.fullName());

        if (request.email() != null && userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        // Validate organization exists
        if (request.organizationId() != null && !organisationService.organizationExists(request.organizationId())) {
            throw new RuntimeException("Organization not found with ID: " + request.organizationId());
        }

        User user = userMapper.toEntity(request);
        user.setUsername(generateUsername(request.fullName()));
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setStatus(UserStatus.PENDING_APPROVAL);

        user = userRepository.save(user);

        // Initialize wallet for the new vendor
        try {
            walletPublicService.initWallet(user.getId());
            logger.info("Wallet initialized for vendor: {}", user.getId());
        } catch (Exception e) {
            logger.warn("Failed to initialize wallet for vendor {}: {}", user.getId(), e.getMessage());
            // Don't fail registration if wallet initialization fails
        }

        // Publish event for notification
        UserRegisteredEvent event = new UserRegisteredEvent(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name()
        );
        eventPublisher.publishEvent(event);

        return userMapper.toResponse(user);
    }

    private String generateUsername(String fullName) {
        String baseUsername = fullName.toLowerCase()
            .replaceAll("[^a-z0-9]", "");

        if (baseUsername.length() > 15) {
            baseUsername = baseUsername.substring(0, 15);
        }

        for (int i = 0; i < 10; i++) {
            String randomSuffix = String.format("%04d", (int)(Math.random() * 10000));
            String candidateUsername = baseUsername + randomSuffix;

            if (!userRepository.findByUsername(candidateUsername).isPresent()) {
                return candidateUsername;
            }
        }

        String timestampSuffix = String.valueOf(System.currentTimeMillis() % 10000);
        return baseUsername + timestampSuffix;
    }
}
