package com.bitedash.organisation.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bitedash.organisation.constant.OrganisationConstants.Error;
import com.bitedash.organisation.dto.request.LocationRequest;
import com.bitedash.organisation.dto.request.OfficeRequest;
import com.bitedash.organisation.dto.response.DashboardStatsResponse;
import com.bitedash.organisation.dto.response.LocationResponse;
import com.bitedash.organisation.dto.response.OfficeResponse;
import com.bitedash.organisation.entity.Location;
import com.bitedash.organisation.entity.Office;
import com.bitedash.organisation.entity.Organization;
import com.bitedash.organisation.mapper.LocationMapper;
import com.bitedash.organisation.mapper.OfficeMapper;
import com.bitedash.organisation.repository.CafeteriaRepository;
import com.bitedash.organisation.repository.LocationRepository;
import com.bitedash.organisation.repository.OfficeRepository;
import com.bitedash.organisation.repository.OrganizationRepository;
import com.bitedash.shared.util.UserContext;
import com.bitedash.shared.enums.Role;


@Service
public class LocationService {
	private final LocationRepository locationRepository;
	private final OfficeRepository officeRepository;
	private final CafeteriaRepository cafeteriaRepository;
	private final OrganizationRepository organizationRepository;
	private final LocationMapper locationMapper;
	private final OfficeMapper officeMapper;

	public LocationService(LocationRepository locationRepository, OfficeRepository officeRepository,
			CafeteriaRepository cafeteriaRepository, OrganizationRepository organizationRepository,
			LocationMapper locationMapper, OfficeMapper officeMapper) {
		this.locationRepository = locationRepository;
		this.officeRepository = officeRepository;
		this.cafeteriaRepository = cafeteriaRepository;
		this.organizationRepository = organizationRepository;
		this.locationMapper = locationMapper;
		this.officeMapper = officeMapper;
	}

	public LocationResponse saveLocation(LocationRequest locationReq) {
		var userContext = UserContext.get();
		Long authenticatedOrgId = userContext.orgId();
		String userRole = userContext.role();

		// Determine which orgId to use: from request (for SUPER_ADMIN) or from user context
		Long targetOrgId;
		if (locationReq.organizationId() != null) {
			// If orgId provided in request, use it (SUPER_ADMIN can specify any org)
			targetOrgId = locationReq.organizationId();
			// Only SUPER_ADMIN can create locations for other organizations
			if (!"ROLE_SUPER_ADMIN".equals(userRole) && !targetOrgId.equals(authenticatedOrgId)) {
				throw new RuntimeException("You can only create locations for your own organization");
			}
		} else {
			// If not provided, use authenticated user's orgId
			if (authenticatedOrgId == null) {
				throw new RuntimeException("Organization ID is required");
			}
			targetOrgId = authenticatedOrgId;
		}

		if (!organizationRepository.existsById(targetOrgId)) {
			throw new RuntimeException(Error.ORG_NOT_FOUND.getMessage());
		}

		Location location = locationMapper.toEntity(locationReq);

		Organization orgReference = organizationRepository.getReferenceById(targetOrgId);
		location.setOrganization(orgReference);

		locationRepository.save(location);

		return locationMapper.toResponse(location);
	}

	public OfficeResponse createOffice(OfficeRequest officeReq) {

		// Check if location exists
		Location location = locationRepository.findById(officeReq.locationId())
			.orElseThrow(() -> new RuntimeException(Error.LOC_NOT_FOUND.getMessage()));

		var userContext = UserContext.get();
		if (!"ROLE_SUPER_ADMIN".equals(userContext.role())) {
			Long userOrgId = userContext.orgId();
			if (userOrgId == null) {
				throw new RuntimeException("Organization ID is required for non-super admin users");
			}
			if (!location.getOrganization().getId().equals(userOrgId)) {
				throw new RuntimeException("Access denied: You can only create offices in your own organization's locations");
			}
		}

		Office office = officeMapper.toEntity(officeReq);
		office.setLocation(location);

		officeRepository.save(office);
		return officeMapper.toResponse(office);
	}

	public List<LocationResponse> findByOrgId(Long orgId) {

		if (!organizationRepository.existsById(orgId)) {
			throw new RuntimeException(Error.ORG_NOT_FOUND.getMessage());
		}

		List<Location> locations = locationRepository.findByOrganization_Id(orgId);
		List<LocationResponse> responses = locationMapper.toResponse(locations);

		for (int i = 0; i < locations.size(); i++) {
			Location location = locations.get(i);
			LocationResponse response = responses.get(i);

			long officeCount = officeRepository.countByLocation_Id(location.getId());
			long cafeteriaCount = cafeteriaRepository.countByOffice_Location_Id(location.getId());

			response.setOfficeCount((int) officeCount);
			response.setCafeteriaCount((int) cafeteriaCount);
		}

		return responses;
	}

	public List<LocationResponse> findAllLocations() {
		List<Location> locations = locationRepository.findAll();
		List<LocationResponse> responses = locationMapper.toResponse(locations);

		for (int i = 0; i < locations.size(); i++) {
			Location location = locations.get(i);
			LocationResponse response = responses.get(i);

			long officeCount = officeRepository.countByLocation_Id(location.getId());
			long cafeteriaCount = cafeteriaRepository.countByOffice_Location_Id(location.getId());

			response.setOfficeCount((int) officeCount);
			response.setCafeteriaCount((int) cafeteriaCount);
		}

		return responses;
	}

	public LocationResponse updateLocation(Long locationId, LocationRequest locationReq) {

		Location location = locationRepository.findById(locationId)
				.orElseThrow(() -> new RuntimeException("Location not found with id: " + locationId));

		location.setCityName(locationReq.cityName());
		location.setState(locationReq.state());

		locationRepository.save(location);

		return locationMapper.toResponse(location);
	}

	public void deleteLocation(Long locationId) {

		Location location = locationRepository.findById(locationId)
				.orElseThrow(() -> new RuntimeException("Location not found with id: " + locationId));

		location.setDeleted(true);

		locationRepository.save(location);

	}

	public List<OfficeResponse> getOfficesByLocation(Long locationId) {

		if (!locationRepository.existsById(locationId)) {
			throw new RuntimeException(Error.LOC_NOT_FOUND.getMessage());
		}

		List<Office> offices = officeRepository.findByLocation_Id(locationId);
		List<OfficeResponse> responses = officeMapper.toResponse(offices);

		for (int i = 0; i < offices.size(); i++) {
			Office office = offices.get(i);
			OfficeResponse response = responses.get(i);

			long cafeteriaCount = cafeteriaRepository.countByOffice_Id(office.getId());
			response.setCafeteriaCount((int) cafeteriaCount);
		}

		return responses;
	}

	public OfficeResponse updateOffice(Long officeId, OfficeRequest officeReq) {

		Office office = officeRepository.findById(officeId)
				.orElseThrow(() -> new RuntimeException("Office not found with id: " + officeId));

		office.setOfficeName(officeReq.officeName());
		office.setAddress(officeReq.address());
		office.setTotalFloors(officeReq.totalFloors());

		officeRepository.save(office);
		return officeMapper.toResponse(office);
	}

	public void deleteOffice(Long officeId) {
		Office office = officeRepository.findById(officeId)
				.orElseThrow(() -> new RuntimeException("Office not found with id: " + officeId));

		office.setDeleted(true);
		officeRepository.save(office);

	}

	public DashboardStatsResponse getDashboardStats() {

		var userContext = UserContext.get();
		Long orgId = userContext.orgId();
		String userRole = userContext.role();

		// If orgId is null (SUPER_ADMIN case), return aggregated stats for all organizations
		if (orgId == null) {
			if ("ROLE_SUPER_ADMIN".equals(userRole)) {
				long locationCount = locationRepository.count();
				long officeCount = officeRepository.count();
				long cafeteriaCount = cafeteriaRepository.count();
				return new DashboardStatsResponse((int) locationCount, (int) officeCount, (int) cafeteriaCount);
			} else {
				throw new RuntimeException("Organization ID is required for non-super admin users");
			}
		}

		if (!organizationRepository.existsById(orgId)) {
			throw new RuntimeException(Error.ORG_NOT_FOUND.getMessage());
		}

		long locationCount = locationRepository.countByOrganization_Id(orgId);
		long officeCount = officeRepository.countByLocation_Organization_Id(orgId);
		long cafeteriaCount = cafeteriaRepository.countByOffice_Location_Organization_Id(orgId);

		return new DashboardStatsResponse((int) locationCount, (int) officeCount, (int) cafeteriaCount);
	}
}
