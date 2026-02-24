package com.bitedash.organisation.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.bitedash.organisation.dto.request.OfficeRequest;
import com.bitedash.organisation.dto.response.OfficeResponse;
import com.bitedash.organisation.entity.Office;

@Mapper(componentModel = "spring")
public interface OfficeMapper {

	Office toEntity(OfficeRequest office);
	OfficeResponse toResponse(Office office);
	List<OfficeResponse> toResponse(List<Office> offices);

}
