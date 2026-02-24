package com.bitedash.organisation.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bitedash.organisation.constant.OrganisationConstants.Error;
import com.bitedash.organisation.dto.request.CafeteriaRequest;
import com.bitedash.organisation.dto.response.CafeteriaResponse;
import com.bitedash.organisation.entity.Cafeteria;
import com.bitedash.organisation.entity.Office;
import com.bitedash.organisation.mapper.CafeteriaMapper;
import com.bitedash.organisation.repository.CafeteriaRepository;
import com.bitedash.organisation.repository.OfficeRepository;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;

@Service
public class CafeteriaService {
	private final CafeteriaRepository cafeteriaRepository;
	private final OfficeRepository officeRepository;
	private final CafeteriaMapper cafeteriaMapper;

	public CafeteriaService(CafeteriaRepository cafeteriaRepository,OfficeRepository officeRepository ,CafeteriaMapper cafeteriaMapper) {
		this.cafeteriaRepository = cafeteriaRepository;
		this.officeRepository=officeRepository;
		this.cafeteriaMapper = cafeteriaMapper;
	}

	public CafeteriaResponse createCafeteria(CafeteriaRequest cafeteria) {

		// Check if office exists
		Office office = officeRepository.findById(cafeteria.officeId())
			.orElseThrow(() -> new RuntimeException(Error.OFFICE_NOT_FOUND.getMessage()));

		// Validate organization hierarchy (unless SUPER_ADMIN)
		var userContext = UserContext.get();
		if (!"ROLE_SUPER_ADMIN".equals(userContext.role())) {
			Long userOrgId = userContext.orgId();
			if (userOrgId == null) {
				throw new RuntimeException("Organization ID is required for non-super admin users");
			}
			// Office -> Location -> Organization
			Long officeOrgId = office.getLocation().getOrganization().getId();
			if (!officeOrgId.equals(userOrgId)) {
				throw new RuntimeException("Access denied: You can only create cafeterias in your own organization's offices");
			}
		}

		Cafeteria newCafeteria = cafeteriaMapper.toEntity(cafeteria);
		newCafeteria.setOffice(office);

		cafeteriaRepository.save(newCafeteria);

		return cafeteriaMapper.toResponse(newCafeteria);
	}

	public List<CafeteriaResponse> findByOfficeId(Long officeId) {

		if (!officeRepository.existsById(officeId)) {
			throw new RuntimeException(Error.OFFICE_NOT_FOUND.getMessage());
		}

		List<Cafeteria> cafeterias = cafeteriaRepository.findByOffice_Id(officeId);
		return cafeteriaMapper.toResponse(cafeterias);
	}

	public CafeteriaResponse updateCafeteria(Long id, CafeteriaRequest cafeteriaReq) {

		Cafeteria cafeteria = cafeteriaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException(Error.CAFE_NOT_FOUND.getMessage()));

		cafeteria.setName(cafeteriaReq.name());
		cafeteria.setFloorNumber(cafeteriaReq.floorNumber());

		cafeteria.setCapacity(cafeteriaReq.capacity());
		cafeteria.setOpeningTime(cafeteriaReq.openingTime());
		cafeteria.setClosingTime(cafeteriaReq.closingTime());

		cafeteriaRepository.save(cafeteria);
		return cafeteriaMapper.toResponse(cafeteria);
	}

	public CafeteriaResponse updateStatus(Long id, Boolean active) {
		Cafeteria cafeteria = cafeteriaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException(Error.CAFE_NOT_FOUND.getMessage()));

		cafeteria.setIsActive(active);

		cafeteriaRepository.save(cafeteria);
		return cafeteriaMapper.toResponse(cafeteria);
	}

	public void deleteCafeteria(Long id) {

		Cafeteria cafeteria = cafeteriaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException(Error.CAFE_NOT_FOUND.getMessage()));

		cafeteria.setDeleted(true);

		cafeteriaRepository.save(cafeteria);

	}

}
