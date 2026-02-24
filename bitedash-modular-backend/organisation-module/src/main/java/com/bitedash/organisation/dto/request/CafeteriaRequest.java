package com.bitedash.organisation.dto.request;

import java.time.LocalTime;

public record CafeteriaRequest(
	Long officeId,
	String name,
	Integer floorNumber,
	Integer capacity,
	LocalTime openingTime,
	LocalTime closingTime
) {
}
