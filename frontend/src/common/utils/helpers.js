// General helper utility functions

import { LOCL_STRG_KEY, ROLES } from '../../config/constants';

/**
 * Debounce function to limit rapid function calls
 * Useful for search inputs, resize handlers, etc.
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to ensure function runs at most once per interval
 * Useful for scroll handlers, button clicks, etc.
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object (handles nested objects and arrays)
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

/**
 * Group array items by a key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array with possible duplicates
 * @param {string} key - Optional key for object arrays
 * @returns {Array} Array with duplicates removed
 */
export const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  const seen = new Set();
  return array.filter(item => {
    const k = item[key];
    return seen.has(k) ? false : seen.add(k);
  });
};

/**
 * Sort array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Get user from localStorage
 * @returns {Object|null} User object or null
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(LOCL_STRG_KEY.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * Get token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getStoredToken = () => {
  return localStorage.getItem(LOCL_STRG_KEY.TOKEN);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getStoredToken() && !!getStoredUser();
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has role
 */
export const hasRole = (role) => {
  const user = getStoredUser();
  return user?.role === role;
};

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} roles - Roles to check
 * @returns {boolean} True if user has any role
 */
export const hasAnyRole = (roles) => {
  const user = getStoredUser();
  return roles.includes(user?.role);
};

/**
 * Get redirect path based on user role
 * @param {string} role - User role
 * @returns {string} Redirect path
 */
export const getRoleBasedPath = (role) => {
  const pathMap = {
    [ROLES.SUPER_ADMIN]: '/admin/dashboard',
    [ROLES.ORG_ADMIN]: '/org-admin/dashboard',
    [ROLES.VENDOR]: '/vendor/dashboard',
    [ROLES.EMPLOYEE]: '/employee/menu',
  };
  return pathMap[role] || '/';
};

/**
 * Generate random ID (useful for temporary IDs before backend assignment)
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Sleep/delay function (useful for testing loading states)
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if code is running in browser (vs SSR)
 * @returns {boolean} True if in browser
 */
export const isBrowser = () => {
  return typeof window !== 'undefined';
};

/**
 * Check if device is mobile based on screen width
 * @returns {boolean} True if mobile
 */
export const isMobile = () => {
  if (!isBrowser()) return false;
  return window.innerWidth < 768;
};

/**
 * Detect if device supports touch
 * @returns {boolean} True if touch supported
 */
export const isTouchDevice = () => {
  if (!isBrowser()) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
export const getQueryParam = (param) => {
  if (!isBrowser()) return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export const copyToClipboard = async (text) => {
  if (!isBrowser()) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - Filename
 * @param {string} type - MIME type
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
  if (!isBrowser()) return;

  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format bytes to human readable size
 * @param {number} bytes - Bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted size
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Create an array of numbers in a range
 * @param {number} start - Start number
 * @param {number} end - End number
 * @param {number} step - Step size
 * @returns {Array<number>} Array of numbers
 */
export const range = (start, end, step = 1) => {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array<Array>} Chunked array
 */
export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
