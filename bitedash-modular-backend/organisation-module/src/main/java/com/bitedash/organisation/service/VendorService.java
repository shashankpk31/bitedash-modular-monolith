package com.bitedash.organisation.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bitedash.organisation.constant.OrganisationConstants.Error;
import com.bitedash.organisation.dto.request.VendorRequest;
import com.bitedash.organisation.dto.response.VendorResponse;
import com.bitedash.organisation.entity.Cafeteria;
import com.bitedash.organisation.entity.Vendor;
import com.bitedash.organisation.mapper.VendorMapper;
import com.bitedash.organisation.repository.CafeteriaRepository;
import com.bitedash.organisation.repository.VendorRepository;

@Service
public class VendorService {
	private final VendorRepository vendorRepository;
	private final CafeteriaRepository cafeteriaRepository;
	private final VendorMapper vendorMapper;

	public VendorService(VendorRepository vendorRepository, CafeteriaRepository cafeteriaRepository,
			VendorMapper vendorMapper) {
		this.vendorRepository = vendorRepository;
		this.cafeteriaRepository = cafeteriaRepository;
		this.vendorMapper = vendorMapper;
	}

	public VendorResponse createVendor(VendorRequest req) {
		Vendor vendor = vendorMapper.toEntity(req);
		vendorRepository.save(vendor);
		return vendorMapper.toResponse(vendor);
	}

	public List<VendorResponse> getVendorsByCafeteria(Long cafeteriaId) {
		Cafeteria cafeteria = cafeteriaRepository.findById(cafeteriaId)
				.orElseThrow(() -> new RuntimeException(Error.CAFE_NOT_FOUND.getMessage()));
		List<Vendor> vendors = vendorRepository.findByCafeteriaMappings_Cafeteria(cafeteria);
		return vendorMapper.toResponse(vendors);
	}
}
