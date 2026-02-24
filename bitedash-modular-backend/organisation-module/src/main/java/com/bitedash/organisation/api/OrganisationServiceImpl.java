package com.bitedash.organisation.api;

import org.springframework.stereotype.Service;

import com.bitedash.organisation.dto.response.CafeteriaResponse;
import com.bitedash.organisation.dto.response.OfficeResponse;
import com.bitedash.organisation.dto.response.OrganizationResponse;
import com.bitedash.organisation.dto.response.VendorResponse;
import com.bitedash.organisation.entity.Cafeteria;
import com.bitedash.organisation.entity.Office;
import com.bitedash.organisation.entity.Vendor;
import com.bitedash.organisation.mapper.CafeteriaMapper;
import com.bitedash.organisation.mapper.OfficeMapper;
import com.bitedash.organisation.mapper.VendorMapper;
import com.bitedash.organisation.repository.CafeteriaRepository;
import com.bitedash.organisation.repository.OfficeRepository;
import com.bitedash.organisation.repository.OrganizationRepository;
import com.bitedash.organisation.repository.VendorRepository;
import com.bitedash.organisation.repository.VendorCafeteriaMappingRepository;
import com.bitedash.shared.api.organisation.OrganisationService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the public API for organisation-module.
 * This service is exposed to other modules for cross-module communication.
 * Implements interface from shared-module to avoid circular dependencies.
 */
@Service
public class OrganisationServiceImpl implements OrganisationService {

    private final OrganizationRepository organizationRepository;
    private final VendorRepository vendorRepository;
    private final CafeteriaRepository cafeteriaRepository;
    private final OfficeRepository officeRepository;
    private final VendorCafeteriaMappingRepository vendorCafeteriaMappingRepository;
    private final VendorMapper vendorMapper;
    private final CafeteriaMapper cafeteriaMapper;
    private final OfficeMapper officeMapper;
    private final com.bitedash.organisation.service.OrganizationService organizationService;

    public OrganisationServiceImpl(
            OrganizationRepository organizationRepository,
            VendorRepository vendorRepository,
            CafeteriaRepository cafeteriaRepository,
            OfficeRepository officeRepository,
            VendorCafeteriaMappingRepository vendorCafeteriaMappingRepository,
            VendorMapper vendorMapper,
            CafeteriaMapper cafeteriaMapper,
            OfficeMapper officeMapper,
            com.bitedash.organisation.service.OrganizationService organizationService) {
        this.organizationRepository = organizationRepository;
        this.vendorRepository = vendorRepository;
        this.cafeteriaRepository = cafeteriaRepository;
        this.officeRepository = officeRepository;
        this.vendorCafeteriaMappingRepository = vendorCafeteriaMappingRepository;
        this.vendorMapper = vendorMapper;
        this.cafeteriaMapper = cafeteriaMapper;
        this.officeMapper = officeMapper;
        this.organizationService = organizationService;
    }

    // ===== Shared Interface Implementation (primitive return types) =====

    @Override
    public boolean vendorExists(Long vendorId) {
        return vendorRepository.existsById(vendorId);
    }

    @Override
    public boolean organizationExists(Long orgId) {
        return organizationRepository.existsById(orgId);
    }

    @Override
    public boolean cafeteriaExists(Long cafeteriaId) {
        return cafeteriaRepository.existsById(cafeteriaId);
    }

    @Override
    public boolean officeExists(Long officeId) {
        return officeRepository.existsById(officeId);
    }

    @Override
    public List<Long> getActiveVendorIdsByCafeteria(Long cafeteriaId) {
        return vendorCafeteriaMappingRepository
                .findByCafeteria_IdAndIsActiveTrue(cafeteriaId)
                .stream()
                .map(mapping -> mapping.getVendor().getId())
                .collect(Collectors.toList());
    }

    @Override
    public Long getVendorIdByOwnerUserId(Long ownerUserId) {
        return vendorRepository.findByOwnerUserId(ownerUserId)
                .map(Vendor::getId)
                .orElse(null);
    }

    @Override
    public String getVendorNameById(Long vendorId) {
        return vendorRepository.findById(vendorId)
                .map(Vendor::getName)
                .orElse(null);
    }

    // ===== Helper methods for internal use (returning full DTOs) =====

    public OrganizationResponse getOrganizationByIdDetailed(Long id) {
        return organizationService.findOrganizationById(id);
    }

    public VendorResponse getVendorByIdDetailed(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        return vendorMapper.toResponse(vendor);
    }

    public VendorResponse getVendorByOwnerUserIdDetailed(Long ownerUserId) {
        Vendor vendor = vendorRepository.findByOwnerUserId(ownerUserId)
                .orElseThrow(() -> new RuntimeException("Vendor not found for owner user id: " + ownerUserId));
        return vendorMapper.toResponse(vendor);
    }

    public CafeteriaResponse getCafeteriaByIdDetailed(Long id) {
        Cafeteria cafeteria = cafeteriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cafeteria not found with id: " + id));
        return cafeteriaMapper.toResponse(cafeteria);
    }

    public OfficeResponse getOfficeByIdDetailed(Long id) {
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Office not found with id: " + id));
        return officeMapper.toResponse(office);
    }
}
