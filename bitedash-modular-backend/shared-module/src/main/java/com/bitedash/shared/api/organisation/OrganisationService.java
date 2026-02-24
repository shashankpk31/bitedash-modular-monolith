package com.bitedash.shared.api.organisation;

import java.util.List;

/**
 * Public API for organisation-module.
 * This interface is in shared-module to avoid circular dependencies.
 * Implementation is in organisation-module.
 */
public interface OrganisationService {

    /**
     * Check if organization exists
     */
    boolean organizationExists(Long orgId);

    /**
     * Check if vendor exists
     */
    boolean vendorExists(Long vendorId);

    /**
     * Check if cafeteria exists
     */
    boolean cafeteriaExists(Long cafeteriaId);

    /**
     * Check if office exists
     */
    boolean officeExists(Long officeId);

    /**
     * Get active vendor IDs for a cafeteria
     */
    List<Long> getActiveVendorIdsByCafeteria(Long cafeteriaId);

    /**
     * Get vendor ID by owner user ID
     * Returns null if not found
     */
    Long getVendorIdByOwnerUserId(Long ownerUserId);

    /**
     * Get vendor name by ID
     * Returns null if not found
     */
    String getVendorNameById(Long vendorId);
}
