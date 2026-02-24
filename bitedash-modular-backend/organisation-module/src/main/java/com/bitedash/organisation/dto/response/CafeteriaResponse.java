package com.bitedash.organisation.dto.response;

import java.time.LocalTime;

public class CafeteriaResponse {
	private Long id;
	private Long officeId;
	private String name;
	private Integer floorNumber;
	private Boolean isActive;

	private Integer capacity;
	private LocalTime openingTime;
	private LocalTime closingTime;

	public CafeteriaResponse() {
		super();
	}

	public CafeteriaResponse(Long id, String name, Integer floorNumber, Boolean isActive) {
		super();
		this.id = id;
		this.name = name;
		this.floorNumber = floorNumber;
		this.isActive = isActive;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getFloorNumber() {
		return floorNumber;
	}

	public void setFloorNumber(Integer floorNumber) {
		this.floorNumber = floorNumber;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public Long getOfficeId() {
		return officeId;
	}

	public void setOfficeId(Long officeId) {
		this.officeId = officeId;
	}

	public Integer getCapacity() {
		return capacity;
	}

	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}

	public LocalTime getOpeningTime() {
		return openingTime;
	}

	public void setOpeningTime(LocalTime openingTime) {
		this.openingTime = openingTime;
	}

	public LocalTime getClosingTime() {
		return closingTime;
	}

	public void setClosingTime(LocalTime closingTime) {
		this.closingTime = closingTime;
	}
}
