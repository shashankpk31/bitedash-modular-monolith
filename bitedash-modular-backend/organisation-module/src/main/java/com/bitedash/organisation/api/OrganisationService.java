package com.bitedash.organisation.api;

import com.bitedash.organisation.dto.response.OrganizationResponse;
import com.bitedash.organisation.dto.response.VendorResponse;
import com.bitedash.organisation.dto.response.CafeteriaResponse;
import com.bitedash.organisation.dto.response.OfficeResponse;

import java.util.List;

/**
 * Public API for organisation-module to be consumed by other modules.
 * This interface defines methods that other modules can use to interact with organisation data.
 */
public interface OrganisationService {

    /**
     * Get organization by ID
     */
    OrganizationResponse getOrganizationById(Long id);

    /**
     * Get vendor by ID
     */
    VendorResponse getVendorById(Long id);

    /**
     * Get vendor by owner user ID
     */
    VendorResponse getVendorByOwnerUserId(Long ownerUserId);

    /**
     * Get cafeteria by ID
     */
    CafeteriaResponse getCafeteriaById(Long id);

    /**
     * Get office by ID
     */
    OfficeResponse getOfficeById(Long id);

    /**
     * Check if vendor exists
     */
    boolean vendorExists(Long vendorId);

    /**
     * Check if organization exists
     */
    boolean organizationExists(Long orgId);

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
     * Used for cross-module queries (e.g., finding menu items for a cafeteria)
     */
    List<Long> getActiveVendorIdsByCafeteria(Long cafeteriaId);
}
