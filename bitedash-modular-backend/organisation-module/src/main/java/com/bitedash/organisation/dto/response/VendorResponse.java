package com.bitedash.organisation.dto.response;

public class VendorResponse {
	private Long id;
	private Long cafeteriaId;
	private String name;
	private String stallNumber;
	private String contactPerson;
	private Long ownerUserId;
	private Boolean isActive;

	public VendorResponse() {
		super();
	}

	public VendorResponse(Long id, Long cafeteriaId, String name, String stallNumber, String contactPerson,
			Long ownerUserId, Boolean isActive) {
		super();
		this.id = id;
		this.cafeteriaId = cafeteriaId;
		this.name = name;
		this.stallNumber = stallNumber;
		this.contactPerson = contactPerson;
		this.ownerUserId = ownerUserId;
		this.isActive = isActive;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCafeteriaId() {
		return cafeteriaId;
	}

	public void setCafeteriaId(Long cafeteriaId) {
		this.cafeteriaId = cafeteriaId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getStallNumber() {
		return stallNumber;
	}

	public void setStallNumber(String stallNumber) {
		this.stallNumber = stallNumber;
	}

	public String getContactPerson() {
		return contactPerson;
	}

	public void setContactPerson(String contactPerson) {
		this.contactPerson = contactPerson;
	}

	public Long getOwnerUserId() {
		return ownerUserId;
	}

	public void setOwnerUserId(Long ownerUserId) {
		this.ownerUserId = ownerUserId;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
}
