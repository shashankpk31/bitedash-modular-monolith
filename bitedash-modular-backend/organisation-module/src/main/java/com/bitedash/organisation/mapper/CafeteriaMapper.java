package com.bitedash.organisation.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.bitedash.organisation.dto.request.CafeteriaRequest;
import com.bitedash.organisation.dto.response.CafeteriaResponse;
import com.bitedash.organisation.entity.Cafeteria;

@Mapper(componentModel = "spring")
public interface CafeteriaMapper {

	Cafeteria toEntity(CafeteriaRequest cafeteria);

	CafeteriaResponse toResponse(Cafeteria cafeteria);

	List<CafeteriaResponse> toResponse(List<Cafeteria> cafeterias);
}
