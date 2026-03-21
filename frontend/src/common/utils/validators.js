// Validation utility functions

import { VALIDATION } from '../../config/constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validate Indian phone number (10 digits, starts with 6-9)
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return VALIDATION.PHONE_REGEX.test(cleaned);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with message and strength score
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 0 };
  }

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      strength: 1,
    };
  }

  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&#]/.test(password);

  const passedChecks = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (passedChecks < 4) {
    const missing = [];
    if (!hasLowerCase) missing.push('lowercase letter');
    if (!hasUpperCase) missing.push('uppercase letter');
    if (!hasNumber) missing.push('number');
    if (!hasSpecialChar) missing.push('special character');

    return {
      isValid: false,
      message: `Password must include: ${missing.join(', ')}`,
      strength: passedChecks,
    };
  }

  return {
    isValid: true,
    message: 'Strong password',
    strength: 4,
  };
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} True if valid
 */
export const isValidOTP = (otp) => {
  if (!otp) return false;
  const cleaned = otp.replace(/\D/g, '');
  return cleaned.length === VALIDATION.OTP_LENGTH;
};

/**
 * Validate file type for image upload
 * @param {File} file - File to validate
 * @returns {boolean} True if valid image type
 */
export const isValidImageFile = (file) => {
  if (!file) return false;
  return VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if within size limit
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  if (!file) return false;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @returns {boolean} True if meets minimum
 */
export const hasMinLength = (value, minLength) => {
  if (!value) return false;
  return value.toString().length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if within maximum
 */
export const hasMaxLength = (value, maxLength) => {
  if (!value) return true; // Empty values are ok for max length
  return value.toString().length <= maxLength;
};

/**
 * Validate positive number
 * @param {number} value - Value to validate
 * @returns {boolean} True if positive
 */
export const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if in range
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
