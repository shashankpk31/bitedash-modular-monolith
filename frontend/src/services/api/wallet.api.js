// Wallet API endpoints
// Why? Handles wallet balance, transactions, and payments

import api from '../../api/axiosInstance';
import { API_PATHS } from '../../config/constants';

/**
 * Get current user's wallet
 * @returns {Promise} Wallet details with balance
 */
export const getMyWallet = async () => {
  const response = await api.get(`${API_PATHS.WALLET}/my-wallet`);
  return response;
};

/**
 * Get wallet by user ID (admin only)
 * @param {number} userId - User ID
 * @returns {Promise} Wallet details
 */
export const getWalletByUserId = async (userId) => {
  const response = await api.get(`${API_PATHS.WALLET}/user/${userId}`);
  return response;
};

/**
 * Get wallet balance
 * @returns {Promise} Current balance
 */
export const getWalletBalance = async () => {
  const response = await api.get(`${API_PATHS.WALLET}/balance`);
  return response;
};

/**
 * Get wallet transactions
 * @param {Object} params - Query parameters (page, size, type, startDate, endDate)
 * @returns {Promise} List of transactions
 */
export const getWalletTransactions = async (params = {}) => {
  const response = await api.get(`${API_PATHS.WALLET}/transactions`, { params });
  return response;
};

/**
 * Get balance history over time
 * @param {Object} params - Query parameters (startDate, endDate)
 * @returns {Promise} Balance history data
 */
export const getBalanceHistory = async (params = {}) => {
  const response = await api.get(`${API_PATHS.WALLET}/balance-history`, { params });
  return response;
};

/**
 * Get total credits
 * @returns {Promise} Total amount credited
 */
export const getTotalCredits = async () => {
  const response = await api.get(`${API_PATHS.WALLET}/total-credits`);
  return response;
};

/**
 * Get total debits
 * @returns {Promise} Total amount debited
 */
export const getTotalDebits = async () => {
  const response = await api.get(`${API_PATHS.WALLET}/total-debits`);
  return response;
};

/**
 * Credit wallet (admin only)
 * @param {Object} creditData - Credit details (userId, amount, description)
 * @returns {Promise} Updated wallet
 */
export const creditWallet = async (creditData) => {
  const response = await api.post(`${API_PATHS.WALLET}/credit`, creditData);
  return response;
};

/**
 * Debit wallet (admin only or for payments)
 * @param {Object} debitData - Debit details (userId, amount, description)
 * @returns {Promise} Updated wallet
 */
export const debitWallet = async (debitData) => {
  const response = await api.post(`${API_PATHS.WALLET}/debit`, debitData);
  return response;
};

/**
 * Initialize wallet for user (admin only)
 * @param {number} userId - User ID
 * @returns {Promise} Created wallet
 */
export const initializeWallet = async (userId) => {
  const response = await api.post(`${API_PATHS.WALLET}/init/${userId}`);
  return response;
};
