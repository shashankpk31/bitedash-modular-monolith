// Organization, Location, Cafeteria, and Vendor API endpoints
// Why separate file? These are organization-related resources used by multiple roles

import api from '../../api/axiosInstance';
import { API_PATHS } from '../../config/constants';

/**
 * Create organization with admin (super admin only)
 * @param {Object} orgData - Organization and admin data
 * @returns {Promise} Created organization
 */
export const createOrganization = async (orgData) => {
  const response = await api.post(API_PATHS.ORGANIZATION, orgData);
  return response;
};

/**
 * Get all organizations (super admin)
 * @returns {Promise} List of all organizations
 */
export const getAllOrganizations = async () => {
  const response = await api.get(API_PATHS.ORGANIZATION);
  return response;
};

/**
 * Get all organizations (public)
 * @returns {Promise} List of organizations
 */
export const getOrganizations = async () => {
  const response = await api.get(`${API_PATHS.ORGANIZATION}/public`);
  return response;
};

/**
 * Get organization by ID
 * @param {number} organizationId - Organization ID
 * @returns {Promise} Organization details
 */
export const getOrganizationById = async (organizationId) => {
  const response = await api.get(`${API_PATHS.ORGANIZATION}/${organizationId}`);
  return response;
};

/**
 * Get all locations for an organization
 * @param {number} organizationId - Organization ID
 * @returns {Promise} List of locations
 */
export const getLocationsByOrganization = async (organizationId) => {
  const response = await api.get(`${API_PATHS.LOCATION}/locations`, {
    params: { organizationId },
  });
  return response;
};

/**
 * Get location by ID
 * @param {number} locationId - Location ID
 * @returns {Promise} Location details
 */
export const getLocationById = async (locationId) => {
  const response = await api.get(`${API_PATHS.LOCATION}/locations/${locationId}`);
  return response;
};

/**
 * Get all offices for a location
 * @param {number} locationId - Location ID
 * @returns {Promise} List of offices
 */
export const getOfficesByLocation = async (locationId) => {
  const response = await api.get(`${API_PATHS.LOCATION}/offices`, {
    params: { locationId },
  });
  return response;
};

/**
 * Get office by ID
 * @param {number} officeId - Office ID
 * @returns {Promise} Office details
 */
export const getOfficeById = async (officeId) => {
  const response = await api.get(`${API_PATHS.LOCATION}/offices/${officeId}`);
  return response;
};

/**
 * Get all cafeterias for an office
 * @param {number} officeId - Office ID
 * @returns {Promise} List of cafeterias
 */
export const getCafeteriasByOffice = async (officeId) => {
  const response = await api.get(`${API_PATHS.CAFETERIA}/office/${officeId}`);
  return response;
};

/**
 * Get cafeteria by ID
 * @param {number} cafeteriaId - Cafeteria ID
 * @returns {Promise} Cafeteria details
 */
export const getCafeteriaById = async (cafeteriaId) => {
  const response = await api.get(`${API_PATHS.CAFETERIA}/${cafeteriaId}`);
  return response;
};

/**
 * Get all vendors for a cafeteria
 * @param {number} cafeteriaId - Cafeteria ID
 * @returns {Promise} List of vendors
 */
export const getVendorsByCafeteria = async (cafeteriaId) => {
  const response = await api.get(`${API_PATHS.VENDOR}/cafeteria/${cafeteriaId}`);
  return response;
};

/**
 * Get vendor by ID
 * @param {number} vendorId - Vendor ID
 * @returns {Promise} Vendor details with menu items
 */
export const getVendorById = async (vendorId) => {
  const response = await api.get(`${API_PATHS.VENDOR}/${vendorId}`);
  return response;
};

/**
 * Get vendor statistics (for admins)
 * @param {number} vendorId - Vendor ID
 * @returns {Promise} Vendor statistics
 */
export const getVendorStats = async (vendorId) => {
  const response = await api.get(`${API_PATHS.VENDOR}/${vendorId}/stats`);
  return response;
};

/**
 * Get my vendor statistics (for current logged-in vendor)
 * @returns {Promise} Vendor statistics
 */
export const getMyVendorStats = async () => {
  const response = await api.get(`${API_PATHS.VENDOR}/my-stats`);
  return response;
};

/**
 * Get super admin dashboard stats
 * @returns {Promise} Platform-wide statistics
 */
export const getSuperAdminStats = async () => {
  const response = await api.get(`${API_PATHS.ORGANIZATION}/super-admin/stats`);
  return response;
};

/**
 * Get org admin dashboard stats
 * @returns {Promise} Organization statistics
 */
export const getOrgAdminStats = async () => {
  const response = await api.get(`${API_PATHS.ORGANIZATION}/admin/dashboard`);
  return response;
};

// =====================================================
// Location Management CRUD
// =====================================================

/**
 * Create a new location
 * @param {Object} locationData - Location data (orgId, cityName, state, country)
 * @returns {Promise} Created location
 */
export const createLocation = async (locationData) => {
  const response = await api.post(`${API_PATHS.LOCATION}/locations`, locationData);
  return response;
};

/**
 * Update location
 * @param {number} locationId - Location ID
 * @param {Object} locationData - Updated location data
 * @returns {Promise} Updated location
 */
export const updateLocation = async (locationId, locationData) => {
  const response = await api.put(`${API_PATHS.LOCATION}/locations/${locationId}`, locationData);
  return response;
};

/**
 * Delete location
 * @param {number} locationId - Location ID
 * @returns {Promise} Success response
 */
export const deleteLocation = async (locationId) => {
  const response = await api.delete(`${API_PATHS.LOCATION}/locations/${locationId}`);
  return response;
};

// =====================================================
// Office Management CRUD
// =====================================================

/**
 * Create a new office
 * @param {Object} officeData - Office data (locationId, officeName, address, totalFloors)
 * @returns {Promise} Created office
 */
export const createOffice = async (officeData) => {
  const response = await api.post(`${API_PATHS.LOCATION}/offices`, officeData);
  return response;
};

/**
 * Update office
 * @param {number} officeId - Office ID
 * @param {Object} officeData - Updated office data
 * @returns {Promise} Updated office
 */
export const updateOffice = async (officeId, officeData) => {
  const response = await api.put(`${API_PATHS.LOCATION}/offices/${officeId}`, officeData);
  return response;
};

/**
 * Delete office
 * @param {number} officeId - Office ID
 * @returns {Promise} Success response
 */
export const deleteOffice = async (officeId) => {
  const response = await api.delete(`${API_PATHS.LOCATION}/offices/${officeId}`);
  return response;
};

// =====================================================
// Cafeteria Management CRUD
// =====================================================

/**
 * Create a new cafeteria
 * @param {Object} cafeteriaData - Cafeteria data (officeId, name, floorNumber, openingTime, closingTime, capacity)
 * @returns {Promise} Created cafeteria
 */
export const createCafeteria = async (cafeteriaData) => {
  const response = await api.post(`${API_PATHS.CAFETERIA}`, cafeteriaData);
  return response;
};

/**
 * Update cafeteria
 * @param {number} cafeteriaId - Cafeteria ID
 * @param {Object} cafeteriaData - Updated cafeteria data
 * @returns {Promise} Updated cafeteria
 */
export const updateCafeteria = async (cafeteriaId, cafeteriaData) => {
  const response = await api.put(`${API_PATHS.CAFETERIA}/${cafeteriaId}`, cafeteriaData);
  return response;
};

/**
 * Delete cafeteria
 * @param {number} cafeteriaId - Cafeteria ID
 * @returns {Promise} Success response
 */
export const deleteCafeteria = async (cafeteriaId) => {
  const response = await api.delete(`${API_PATHS.CAFETERIA}/${cafeteriaId}`);
  return response;
};

// =====================================================
// Vendor Operations
// =====================================================

/**
 * Get my vendor profile (for logged-in vendor)
 * @returns {Promise} Vendor details
 */
export const getMyVendor = async () => {
  const response = await api.get(`${API_PATHS.VENDOR}/my-vendor`);
  return response;
};
