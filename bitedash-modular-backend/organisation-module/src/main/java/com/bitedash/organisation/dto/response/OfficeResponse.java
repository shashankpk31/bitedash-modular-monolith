package com.bitedash.organisation.dto.response;

public class OfficeResponse {
    private Long id;
    private Long locationId;
    private String officeName;
    private String address;

    private Integer totalFloors;

    private Integer cafeteriaCount;

	public OfficeResponse() {
		super();
	}
	public OfficeResponse(Long id, Long locationId, String officeName, String address) {
		super();
		this.id = id;
		this.locationId = locationId;
		this.officeName = officeName;
		this.address = address;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getLocationId() {
		return locationId;
	}
	public void setLocationId(Long locationId) {
		this.locationId = locationId;
	}
	public String getOfficeName() {
		return officeName;
	}
	public void setOfficeName(String officeName) {
		this.officeName = officeName;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}

	public Integer getTotalFloors() {
		return totalFloors;
	}

	public void setTotalFloors(Integer totalFloors) {
		this.totalFloors = totalFloors;
	}

	public Integer getCafeteriaCount() {
		return cafeteriaCount;
	}

	public void setCafeteriaCount(Integer cafeteriaCount) {
		this.cafeteriaCount = cafeteriaCount;
	}
}
