package com.bitedash.organisation.dto.response;

public class LocationResponse {
	private Long id;
	private Long orgId;
	private String cityName;
	private String state;

	private Integer officeCount;
	private Integer cafeteriaCount;

	public LocationResponse() {
		super();
	}

	public LocationResponse(Long id, Long orgId, String cityName, String state) {
		super();
		this.id = id;
		this.orgId = orgId;
		this.cityName = cityName;
		this.state = state;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getOrgId() {
		return orgId;
	}

	public void setOrgId(Long orgId) {
		this.orgId = orgId;
	}

	public String getCityName() {
		return cityName;
	}

	public void setCityName(String cityName) {
		this.cityName = cityName;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public Integer getOfficeCount() {
		return officeCount;
	}

	public void setOfficeCount(Integer officeCount) {
		this.officeCount = officeCount;
	}

	public Integer getCafeteriaCount() {
		return cafeteriaCount;
	}

	public void setCafeteriaCount(Integer cafeteriaCount) {
		this.cafeteriaCount = cafeteriaCount;
	}
}
