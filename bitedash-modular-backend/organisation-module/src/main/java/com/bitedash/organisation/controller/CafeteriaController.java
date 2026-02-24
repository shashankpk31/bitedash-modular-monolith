package com.bitedash.organisation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.organisation.constant.OrganisationConstants.Message;
import com.bitedash.organisation.dto.request.CafeteriaRequest;
import com.bitedash.organisation.service.CafeteriaService;

@RestController
@RequestMapping({"/organisation/cafeterias", "/organization/cafeterias"})  // Support both spellings
public class CafeteriaController {

	private final CafeteriaService cafeteriaService;

	public CafeteriaController(CafeteriaService cafeteriaService) {
		this.cafeteriaService = cafeteriaService;
	}

	@PostMapping
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> createCafeteria(@RequestBody CafeteriaRequest cafeteria) {
		return ResponseEntity.status(HttpStatus.CREATED).body(
				new ApiResponse(true, Message.CAF_CREATED.getMessage(), cafeteriaService.createCafeteria(cafeteria)));
	}

	@GetMapping("/office/{officeId}")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN, Role.ROLE_VENDOR, Role.ROLE_EMPLOYEE})
	public ResponseEntity<ApiResponse> getByOffice(@PathVariable Long officeId) {
		return ResponseEntity.status(HttpStatus.OK).body(
				new ApiResponse(true, Message.CAF_FETCHED.getMessage(), cafeteriaService.findByOfficeId(officeId)));
	}

	@PutMapping("/{id}")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> updateCafeteria(
			@PathVariable Long id,
			@RequestBody CafeteriaRequest cafeteriaRequest) {
		return ResponseEntity.status(HttpStatus.OK).body(
				new ApiResponse(true, Message.CAF_UPDATED.getMessage(),
						cafeteriaService.updateCafeteria(id, cafeteriaRequest)));
	}

	@PutMapping("/{id}/status")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> toggleStatus(@PathVariable Long id, @RequestParam Boolean active) {
		return ResponseEntity.status(HttpStatus.OK).body(
				new ApiResponse(true, Message.CAF_UPDATED.getMessage(), cafeteriaService.updateStatus(id, active)));
	}

	@DeleteMapping("/{id}")
	@RequireRole({Role.ROLE_SUPER_ADMIN, Role.ROLE_ORG_ADMIN})
	public ResponseEntity<ApiResponse> deleteCafeteria(@PathVariable Long id) {
		cafeteriaService.deleteCafeteria(id);
		return ResponseEntity.status(HttpStatus.OK).body(
				new ApiResponse(true, Message.CAF_DELETED.getMessage(), null));
	}
}
