package com.bitedash.shared.api.identity;

import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;

/**
 * Public API for identity-module.
 * This interface is in shared-module to avoid circular dependencies.
 * Implementation is in identity-module.
 */
public interface UserService {

    /**
     * Count pending vendors (for admin dashboard)
     */
    Integer countPendingVendors();

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

    /**
     * Get user's role
     */
    Role getUserRole(Long userId);

    /**
     * Get user's status
     */
    UserStatus getUserStatus(Long userId);

    /**
     * Get user's email
     */
    String getUserEmail(Long userId);

    /**
     * Get user's full name
     */
    String getUserFullName(Long userId);

    /**
     * Register organization admin (called by organisation module)
     * Returns the created user ID
     */
    Long registerOrgAdmin(String fullName, String email, String password, String phoneNumber,
                          Long organizationId, String employeeId, Long officeId,
                          String shopName, String gstNumber);
}
