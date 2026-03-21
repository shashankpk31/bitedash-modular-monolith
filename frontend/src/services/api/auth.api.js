// Auth API endpoints - raw API calls without React hooks
// Why separate from hooks? Allows reuse outside React components (e.g., interceptors)

import api from '../../api/axiosInstance';
import { API_PATHS } from '../../config/constants';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Registration response
 */
export const registerUser = async (userData) => {
  const response = await api.post(`${API_PATHS.AUTH}/register`, userData);
  return response;
};

/**
 * Verify user account with OTP
 * @param {string} identifier - Email or phone
 * @param {string} otp - One-time password
 * @returns {Promise} Verification response with token
 */
export const verifyAccount = async (identifier, otp) => {
  const response = await api.post(`${API_PATHS.AUTH}/verify`, null, {
    params: { identifier, otp }
  });
  return response;
};

/**
 * Resend OTP for verification
 * @param {string} identifier - Email or phone
 * @param {string} type - OTP type (EMAIL or SMS)
 * @returns {Promise} Success response
 */
export const resendOTP = async (identifier, type = 'EMAIL') => {
  const response = await api.post(`${API_PATHS.AUTH}/resend-otp`, null, {
    params: { identifier, type }
  });
  return response;
};

/**
 * Login user with credentials
 * @param {string} userIdentifier - Email or phone
 * @param {string} password - User password
 * @returns {Promise} Login response with token and user data
 */
export const loginUser = async (userIdentifier, password) => {
  const response = await api.post(`${API_PATHS.AUTH}/login`, {
    userIdentifier,
    password,
  });
  return response;
};

/**
 * Logout current user
 * @returns {Promise} Logout response
 */
export const logoutUser = async () => {
  const response = await api.post(`${API_PATHS.AUTH}/logout`);
  return response;
};

/**
 * Refresh authentication token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} New tokens
 */
export const refreshAuthToken = async (refreshToken) => {
  const response = await api.post(`${API_PATHS.AUTH}/refresh`, {
    refreshToken,
  });
  return response;
};

/**
 * Validate current token
 * @returns {Promise} Validation response
 */
export const validateToken = async () => {
  const response = await api.get(`${API_PATHS.AUTH}/validate`);
  return response;
};

/**
 * Request password reset
 * @param {string} identifier - Email or phone
 * @returns {Promise} Success response
 */
export const requestPasswordReset = async (identifier) => {
  const response = await api.post(`${API_PATHS.AUTH}/forgot-password`, {
    identifier,
  });
  return response;
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email/SMS
 * @param {string} newPassword - New password
 * @returns {Promise} Success response
 */
export const resetPassword = async (token, newPassword) => {
  const response = await api.post(`${API_PATHS.AUTH}/reset-password`, {
    token,
    newPassword,
  });
  return response;
};

/**
 * Change password (authenticated user)
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} Success response
 */
export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post(`${API_PATHS.AUTH}/change-password`, {
    oldPassword,
    newPassword,
  });
  return response;
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getCurrentUser = async () => {
  const response = await api.get(`${API_PATHS.USER}/me`);
  return response;
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Promise} Updated user data
 */
export const updateUserProfile = async (updates) => {
  const response = await api.put(`${API_PATHS.USER}/profile`, updates);
  return response;
};

/**
 * Get pending user approvals (org admin)
 * @returns {Promise} List of pending users
 */
export const getPendingApprovals = async () => {
  const response = await api.get(`${API_PATHS.AUTH}/admin/pending-approvals`);
  return response;
};

/**
 * Update user status (approve/reject/block)
 * @param {number} userId - User ID
 * @param {string} status - New status (ACTIVE, BLOCKED, etc.)
 * @returns {Promise} Success response
 */
export const updateUserStatus = async (userId, status) => {
  const response = await api.put(`${API_PATHS.AUTH}/admin/users/${userId}/status`, { status });
  return response;
};
