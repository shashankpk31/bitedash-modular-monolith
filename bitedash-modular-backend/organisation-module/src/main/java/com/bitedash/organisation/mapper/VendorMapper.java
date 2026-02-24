package com.bitedash.organisation.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.bitedash.organisation.dto.request.VendorRequest;
import com.bitedash.organisation.dto.response.VendorResponse;
import com.bitedash.organisation.entity.Vendor;

@Mapper(componentModel = "spring")
public interface VendorMapper {

	Vendor toEntity(VendorRequest req);

	VendorResponse toResponse(Vendor vendor);

	List<VendorResponse> toResponse(List<Vendor> vendors);

}
