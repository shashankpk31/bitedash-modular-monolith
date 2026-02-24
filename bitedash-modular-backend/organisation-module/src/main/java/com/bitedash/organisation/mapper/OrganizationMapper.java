package com.bitedash.organisation.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.bitedash.organisation.dto.request.OrganizationRequest;
import com.bitedash.organisation.dto.response.OrganizationResponse;
import com.bitedash.organisation.entity.Organization;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {

	Organization toEntity(OrganizationRequest req);

	OrganizationResponse toResponse(Organization org);

	List<OrganizationResponse> toResponse(List<Organization> organizations);

}
