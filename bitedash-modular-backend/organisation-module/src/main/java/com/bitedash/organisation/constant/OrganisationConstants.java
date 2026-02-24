package com.bitedash.organisation.constant;

public class OrganisationConstants {

	public enum Warn {
		Warn("Warning");

		private final String message;

		Warn(String message) {
			this.message = message;
		}

		public String getMessage() {
			return message;
		}
	}

	public enum Error {
		ERROR("Error"), ORG_NOT_FOUND("Organisation Not Found"),
		ADMIN_NOT_CREATED("Unable to Create Organisation Admin"), CAFE_NOT_FOUND("Cafeteria Not Found"),
		OFFICE_NOT_FOUND("Office Not Found"), LOC_NOT_FOUND("Location Not Found");

		private final String message;

		Error(String message) {
			this.message = message;
		}

		public String getMessage() {
			return message;
		}
	}

	public enum Message {

		ORG_CREATED("Organization Created Successfully"), ORG_FETCHED("Organization Fetched Successfully"),

		LOC_CREATED("Location Created Successfully"), LOC_FETCHED("Location Fetched Successfully"),
		LOC_UPDATED("Location Updated Successfully"),
		LOC_DELETED("Location Deleted Successfully"),

		OFF_CREATED("Office Created Successfully"), OFF_FETCHED("Office Fetched Successfully"),
		OFF_UPDATED("Office Updated Successfully"),
		OFF_DELETED("Office Deleted Successfully"),

		VEN_CREATED("Vendor Created Successfully"), VEN_FETCHED("Vendor Fetched Successfully"),

		CAF_CREATED("Cafeteria Created Successfully"), CAF_FETCHED("Cafeteria Fetched Successfully"),
		CAF_UPDATED("Cafeteria Updated Successfully"), CAF_DELETED("Cafeteria Deleted Successfully");

		private final String message;

		Message(String message) {
			this.message = message;
		}

		public String getMessage() {
			return message;
		}
	}
}
