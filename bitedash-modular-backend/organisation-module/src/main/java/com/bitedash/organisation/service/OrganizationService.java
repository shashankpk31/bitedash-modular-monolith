package com.bitedash.organisation.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.bitedash.shared.api.identity.UserService;
import com.bitedash.organisation.constant.OrganisationConstants.Error;
import com.bitedash.organisation.dto.request.OrganizationRequest;
import com.bitedash.organisation.dto.response.OrganizationResponse;
import com.bitedash.organisation.dto.response.SuperAdminStatsResponse;
import com.bitedash.organisation.entity.Organization;
import com.bitedash.organisation.mapper.OrganizationMapper;
import com.bitedash.organisation.repository.LocationRepository;
import com.bitedash.organisation.repository.OrganizationRepository;

import jakarta.transaction.Transactional;

@Service
public class OrganizationService {

	private static final Logger log = LoggerFactory.getLogger(OrganizationService.class);

	private final OrganizationRepository organizationRepository;
	private final OrganizationMapper organizationMapper;
	private final LocationRepository locationRepository;
	private final UserService userService;

	public OrganizationService(OrganizationRepository organizationRepository, OrganizationMapper organizationMapper,
			LocationRepository locationRepository, @Lazy UserService userService) {
		this.organizationRepository = organizationRepository;
		this.organizationMapper = organizationMapper;
		this.locationRepository = locationRepository;
		this.userService = userService;
	}

	public OrganizationResponse createOrganization(OrganizationRequest req) {
		Organization org = organizationMapper.toEntity(req);
		organizationRepository.save(org);
		return organizationMapper.toResponse(org);
	}

	public List<OrganizationResponse> findAllOrganisations() {
		List<Organization> organizations = organizationRepository.findAll();
		return organizationMapper.toResponse(organizations);
	}

	public OrganizationResponse findOrganizationById(Long id) {
		Organization org = organizationRepository.findById(id)
				.orElseThrow(() -> new RuntimeException(Error.ORG_NOT_FOUND.getMessage()));
		return organizationMapper.toResponse(org);
	}

	@Transactional
	public void deleteOrganization(Long id) {
		log.info("Rolling back organization creation for ID: {}", id);
	    if (organizationRepository.existsById(id)) {
	        organizationRepository.deleteById(id);
	    } else {
	    	log.warn("Attempted to delete organization {}, but it was already gone.", id);
	    }
	}

	public SuperAdminStatsResponse getSuperAdminStats() {
		try {
			log.info("Fetching Super Admin stats...");

			log.debug("Counting organizations...");
			int totalOrganizations = (int) organizationRepository.count();
			log.debug("Total organizations: {}", totalOrganizations);

			log.debug("Counting locations...");
			int totalLocations = (int) locationRepository.count();
			log.debug("Total locations: {}", totalLocations);

			int pendingVendors = 0;
			try {
				log.debug("Fetching pending vendors from Identity service...");
			pendingVendors = userService.countPendingVendors();
				log.debug("Pending vendors: {}", pendingVendors);
			} catch (Exception e) {
				log.warn("Failed to fetch pending vendors count from Identity service: {}", e.getMessage());
			}

			SuperAdminStatsResponse response = new SuperAdminStatsResponse(totalOrganizations, totalLocations, pendingVendors);
			log.info("Super Admin stats fetched successfully: {}", response);
			return response;

		} catch (Exception e) {
			log.error("ERROR in getSuperAdminStats: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to fetch Super Admin stats: " + e.getMessage(), e);
		}
	}

}
