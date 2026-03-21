package com.bitedash.organisation.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.bitedash.shared.api.identity.UserService;
import com.bitedash.organisation.constant.OrganisationConstants.Error;
import com.bitedash.organisation.dto.request.OrganizationRequest;
import com.bitedash.organisation.dto.response.OrgAdminStatsResponse;
import com.bitedash.organisation.dto.response.OrganizationResponse;
import com.bitedash.organisation.dto.response.SuperAdminStatsResponse;
import com.bitedash.organisation.entity.Organization;
import com.bitedash.organisation.mapper.OrganizationMapper;
import com.bitedash.organisation.repository.LocationRepository;
import com.bitedash.organisation.repository.OrganizationRepository;
import com.bitedash.organisation.repository.VendorRepository;

import jakarta.transaction.Transactional;

@Service
public class OrganizationService {

	private static final Logger log = LoggerFactory.getLogger(OrganizationService.class);

	private final OrganizationRepository organizationRepository;
	private final OrganizationMapper organizationMapper;
	private final LocationRepository locationRepository;
	private final VendorRepository vendorRepository;
	private final UserService userService;

	public OrganizationService(OrganizationRepository organizationRepository, OrganizationMapper organizationMapper,
			LocationRepository locationRepository, VendorRepository vendorRepository, @Lazy UserService userService) {
		this.organizationRepository = organizationRepository;
		this.organizationMapper = organizationMapper;
		this.locationRepository = locationRepository;
		this.vendorRepository = vendorRepository;
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

			log.debug("Counting active organizations...");
			int activeOrganizations = totalOrganizations; // All orgs are active by default
			log.debug("Active organizations: {}", activeOrganizations);

			log.debug("Counting locations...");
			int totalLocations = (int) locationRepository.count();
			log.debug("Total locations: {}", totalLocations);

			log.debug("Counting vendors...");
			int totalVendors = (int) vendorRepository.count();
			log.debug("Total vendors: {}", totalVendors);

			int pendingVendors = 0;
			int totalUsers = 0;
			try {
				log.debug("Fetching pending vendors from Identity service...");
				pendingVendors = userService.countPendingVendors();
				log.debug("Pending vendors: {}", pendingVendors);

				log.debug("Fetching total users from Identity service...");
				totalUsers = userService.countAllUsers();
				log.debug("Total users: {}", totalUsers);
			} catch (Exception e) {
				log.warn("Failed to fetch user counts from Identity service: {}", e.getMessage());
			}

			SuperAdminStatsResponse response = new SuperAdminStatsResponse(
				totalOrganizations,
				activeOrganizations,
				totalLocations,
				totalVendors,
				pendingVendors,
				totalUsers
			);
			log.info("Super Admin stats fetched successfully: {}", response);
			return response;

		} catch (Exception e) {
			log.error("ERROR in getSuperAdminStats: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to fetch Super Admin stats: " + e.getMessage(), e);
		}
	}

	public OrgAdminStatsResponse getOrgAdminStats(Long organizationId) {
		try {
			log.info("Fetching Org Admin stats for organization ID: {}", organizationId);

			// Verify organization exists
			if (!organizationRepository.existsById(organizationId)) {
				throw new RuntimeException(Error.ORG_NOT_FOUND.getMessage());
			}

			// Count employees by organizationId
			int totalEmployees = 0;
			try {
				log.debug("Fetching employee count from Identity service for org: {}", organizationId);
				totalEmployees = userService.countEmployeesByOrganization(organizationId);
				log.debug("Total employees: {}", totalEmployees);
			} catch (Exception e) {
				log.warn("Failed to fetch employee count from Identity service: {}", e.getMessage());
			}

			// Count active vendors (simplified - counts all active vendors for now)
			// TODO: Filter vendors by organization through cafeteria mappings
			log.debug("Counting active vendors...");
			int activeVendors = (int) vendorRepository.findAll().stream()
				.filter(vendor -> Boolean.TRUE.equals(vendor.getIsActive()))
				.count();
			log.debug("Active vendors: {}", activeVendors);

			// Count locations for this organization
			log.debug("Counting locations for org: {}", organizationId);
			int totalLocations = locationRepository.findByOrganization_Id(organizationId).size();
			log.debug("Total locations: {}", totalLocations);

			// Monthly spend and total orders - requires Order/Payment service integration
			// Setting to 0 for now
			Double monthlySpend = 0.0;
			Integer totalOrders = 0;
			Integer pendingApprovals = 0;

			// TODO: Integrate with Order service to get monthlySpend and totalOrders
			// TODO: Integrate with Approval service to get pendingApprovals

			OrgAdminStatsResponse response = new OrgAdminStatsResponse(
				totalEmployees,
				activeVendors,
				monthlySpend,
				totalLocations,
				totalOrders,
				pendingApprovals
			);

			log.info("Org Admin stats fetched successfully for org {}: {}", organizationId, response);
			return response;

		} catch (Exception e) {
			log.error("ERROR in getOrgAdminStats for org {}: {}", organizationId, e.getMessage(), e);
			throw new RuntimeException("Failed to fetch Org Admin stats: " + e.getMessage(), e);
		}
	}

}
