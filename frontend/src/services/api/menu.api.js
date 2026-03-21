// Menu and Menu Items API endpoints
// Why? Handles all menu browsing functionality for employees

import api from '../../api/axiosInstance';
import { API_PATHS } from '../../config/constants';

/**
 * Get all menu items with optional filters
 * @param {Object} params - Query parameters (vendorId, categoryId, search, etc.)
 * @returns {Promise} List of menu items
 */
export const getMenuItems = async (params = {}) => {
  const response = await api.get(API_PATHS.MENU, { params });
  return response;
};

/**
 * Get menu items by vendor
 * @param {number} vendorId - Vendor ID
 * @returns {Promise} List of menu items for vendor
 */
export const getMenuItemsByVendor = async (vendorId) => {
  const response = await api.get(`${API_PATHS.MENU}/vendor/${vendorId}`);
  return response;
};

/**
 * Get menu item by ID
 * @param {number} itemId - Menu item ID
 * @returns {Promise} Menu item details
 */
export const getMenuItemById = async (itemId) => {
  const response = await api.get(`${API_PATHS.MENU}/items/${itemId}`);
  return response;
};

/**
 * Get promoted/featured menu items
 * @returns {Promise} List of promoted items
 */
export const getPromotedMenuItems = async () => {
  const response = await api.get(`${API_PATHS.MENU}/promoted`);
  return response;
};

/**
 * Get all menu categories
 * @returns {Promise} List of categories
 */
export const getMenuCategories = async () => {
  const response = await api.get(`${API_PATHS.MENU}/categories`);
  return response;
};

/**
 * Search menu items
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters (vendorId, categoryId, etc.)
 * @returns {Promise} Search results
 */
export const searchMenuItems = async (query, filters = {}) => {
  const response = await api.get(`${API_PATHS.MENU}/search`, {
    params: { query, ...filters },
  });
  return response;
};

/**
 * Get menu item availability
 * @param {number} itemId - Menu item ID
 * @returns {Promise} Availability status
 */
export const getMenuItemAvailability = async (itemId) => {
  const response = await api.get(`${API_PATHS.MENU}/items/${itemId}/availability`);
  return response;
};

// =====================================================
// Menu Item CRUD Operations (Vendor only)
// =====================================================

/**
 * Create a new menu item
 * @param {Object} menuItemData - Menu item data
 * @returns {Promise} Created menu item
 */
export const createMenuItem = async (menuItemData) => {
  const response = await api.post(`${API_PATHS.MENU}/items`, menuItemData);
  return response;
};

/**
 * Update menu item
 * @param {number} itemId - Menu item ID
 * @param {Object} menuItemData - Updated menu item data
 * @returns {Promise} Updated menu item
 */
export const updateMenuItem = async (itemId, menuItemData) => {
  const response = await api.put(`${API_PATHS.MENU}/items/${itemId}`, menuItemData);
  return response;
};

/**
 * Delete menu item
 * @param {number} itemId - Menu item ID
 * @returns {Promise} Success response
 */
export const deleteMenuItem = async (itemId) => {
  const response = await api.delete(`${API_PATHS.MENU}/items/${itemId}`);
  return response;
};

/**
 * Toggle menu item availability
 * @param {number} itemId - Menu item ID
 * @param {boolean} isAvailable - New availability status
 * @returns {Promise} Updated menu item
 */
export const toggleMenuItemAvailability = async (itemId, isAvailable) => {
  const response = await api.patch(`${API_PATHS.MENU}/items/${itemId}/availability`, {
    isAvailable,
  });
  return response;
};
