package com.bitedash.organisation.dto.request;

public record VendorCafeteriaMappingRequest(
	Long vendorId,
	Long cafeteriaId,
	String stallNumber,
	Boolean isPrimary
) {
}
