// Orders API endpoints
// Why? Handles order placement, tracking, and history

import api from '../../api/axiosInstance';
import { API_PATHS } from '../../config/constants';

/**
 * Create a new order
 * @param {Object} orderData - Order details (items, vendorId, deliveryAddress, etc.)
 * @returns {Promise} Created order details
 */
export const createOrder = async (orderData) => {
  const response = await api.post(API_PATHS.ORDER, orderData);
  return response;
};

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} Order details
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`${API_PATHS.ORDER}/${orderId}`);
  return response;
};

/**
 * Get current user's orders
 * @param {Object} params - Query parameters (status, page, size, etc.)
 * @returns {Promise} List of user's orders
 */
export const getMyOrders = async (params = {}) => {
  const response = await api.get(`${API_PATHS.ORDER}/my-orders`, { params });
  return response;
};

/**
 * Get order history for current user
 * @param {number} orderId - Order ID
 * @returns {Promise} Order history/timeline
 */
export const getOrderHistory = async (orderId) => {
  const response = await api.get(`${API_PATHS.ORDER}/${orderId}/history`);
  return response;
};

/**
 * Cancel an order
 * @param {number} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} Updated order details
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`${API_PATHS.ORDER}/${orderId}/cancel`, { reason });
  return response;
};

/**
 * Rate an order
 * @param {number} orderId - Order ID
 * @param {Object} ratingData - Rating (rating, review)
 * @returns {Promise} Updated order with rating
 */
export const rateOrder = async (orderId, ratingData) => {
  const response = await api.post(`${API_PATHS.ORDER}/${orderId}/rate`, ratingData);
  return response;
};

/**
 * Get active order (for tracking)
 * @returns {Promise} Active order if exists
 */
export const getActiveOrder = async () => {
  const response = await api.get(`${API_PATHS.ORDER}/active`);
  return response;
};

/**
 * Get orders for a vendor (vendor only)
 * @param {number} vendorId - Vendor ID
 * @param {Object} params - Query parameters
 * @returns {Promise} List of vendor orders
 */
export const getVendorOrders = async (vendorId, params = {}) => {
  const response = await api.get(`${API_PATHS.ORDER}/vendor/${vendorId}`, { params });
  return response;
};

/**
 * Update order status (vendor only)
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`${API_PATHS.ORDER}/${orderId}/status`, { status });
  return response;
};
