package com.bitedash.organisation.dto.response;

public class DashboardStatsResponse {

	private Integer locations;
	private Integer offices;
	private Integer cafeterias;

	public DashboardStatsResponse() {
		super();
	}

	public DashboardStatsResponse(Integer locations, Integer offices, Integer cafeterias) {
		super();
		this.locations = locations;
		this.offices = offices;
		this.cafeterias = cafeterias;
	}

	public Integer getLocations() {
		return locations;
	}

	public void setLocations(Integer locations) {
		this.locations = locations;
	}

	public Integer getOffices() {
		return offices;
	}

	public void setOffices(Integer offices) {
		this.offices = offices;
	}

	public Integer getCafeterias() {
		return cafeterias;
	}

	public void setCafeterias(Integer cafeterias) {
		this.cafeterias = cafeterias;
	}
}
