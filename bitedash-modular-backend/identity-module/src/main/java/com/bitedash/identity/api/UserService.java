package com.bitedash.identity.api;

import java.util.List;

import com.bitedash.identity.dto.RegisterOrgRequest;
import com.bitedash.identity.dto.RegisterRequest;
import com.bitedash.identity.dto.UserResponse;
import com.bitedash.shared.enums.Role;

/**
 * Public API for the Identity module.
 * Other modules should depend on this interface to interact with user management.
 */
public interface UserService {

    /**
     * Get user by ID
     */
    UserResponse getUserById(Long id);

    /**
     * Get user by email
     */
    UserResponse getUserByEmail(String email);

    /**
     * Get user by username
     */
    UserResponse getUserByUsername(String username);

    /**
     * Get user by phone number
     */
    UserResponse getUserByPhoneNumber(String phoneNumber);

    /**
     * Count pending vendors (for admin dashboard)
     */
    Integer countPendingVendors();

    /**
     * Get users by role
     */
    List<UserResponse> getUsersByRole(Role role);

    /**
     * Get users by organization ID
     */
    List<UserResponse> getUsersByOrganizationId(Long organizationId);

    /**
     * Register organization admin (called by organization module)
     */
    UserResponse registerOrgAdmin(RegisterOrgRequest request);

    /**
     * Register vendor (called by vendor module)
     */
    UserResponse registerVendor(RegisterRequest request);

    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);

    /**
     * Check if user exists by username
     */
    boolean existsByUsername(String username);

    /**
     * Verify if user belongs to organization
     */
    boolean userBelongsToOrganization(Long userId, Long organizationId);
}
