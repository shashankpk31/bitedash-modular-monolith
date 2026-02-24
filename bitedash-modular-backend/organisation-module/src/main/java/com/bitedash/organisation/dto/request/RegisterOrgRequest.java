package com.bitedash.organisation.dto.request;

import com.bitedash.shared.enums.Role;

public record RegisterOrgRequest(String fullName, String email, String password, Role role, String phoneNumber,
		Long organizationId, String employeeId, Long officeId, String shopName, String gstNumber) {
	public RegisterOrgRequest {
		if (role == null) {
			role = Role.ROLE_ORG_ADMIN;
		}
	}
}
