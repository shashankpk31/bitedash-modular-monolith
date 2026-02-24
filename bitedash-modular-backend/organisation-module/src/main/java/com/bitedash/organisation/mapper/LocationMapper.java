package com.bitedash.organisation.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.bitedash.organisation.dto.request.LocationRequest;
import com.bitedash.organisation.dto.response.LocationResponse;
import com.bitedash.organisation.entity.Location;

@Mapper(componentModel = "spring")
public interface LocationMapper {

	Location toEntity(LocationRequest locationReq);

	LocationResponse toResponse(Location location);

	List<LocationResponse> toResponse(List<Location> locations);

}
