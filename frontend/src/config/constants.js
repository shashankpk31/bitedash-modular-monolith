// Application-wide constants - centralized configuration

// User roles - matches backend Role enum with ROLE_ prefix for Spring Security
export const ROLES = {
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
  ORG_ADMIN: 'ROLE_ORG_ADMIN',
  VENDOR: 'ROLE_VENDOR',
  EMPLOYEE: 'ROLE_EMPLOYEE',
};

// Local storage keys - consistent naming to prevent conflicts
export const LOCL_STRG_KEY = {
  TOKEN: 'bitedash_token',
  USER: 'bitedash_user',
  REFRESH_TOKEN: 'bitedash_refresh_token',
  CART: 'bitedash_cart',
  LOCATION: 'bitedash_location',
};

// Legacy support for old keys
export const AUTH_CONST = {
  TOKEN: LOCL_STRG_KEY.TOKEN,
  USER: LOCL_STRG_KEY.USER,
};

// API base URL from environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

// API path prefixes
export const API_PATHS = {
  AUTH: '/auth',
  USER: '/user',
  ORGANIZATION: '/organization',
  ORGANISATION: '/organisation', // British spelling support
  LOCATION: '/organisation',
  CAFETERIA: '/organisation/cafeterias',
  VENDOR: '/organisation/vendors/stalls',
  MENU: '/menus',
  ORDER: '/orders',
  WALLET: '/wallet',
  REVENUE: '/revenue',
  INVENTORY: '/inventory',
  PAYMENT: '/payment',
};

// Order statuses - matches backend OrderStatus enum
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  PICKED_UP: 'PICKED_UP',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// User account statuses - matches backend approval flow
export const USER_STATUS = {
  PENDING: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
};

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_READY: 'ORDER_READY',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  WALLET_CREDITED: 'WALLET_CREDITED',
  ACCOUNT_APPROVED: 'ACCOUNT_APPROVED',
};

// TanStack Query keys - centralized for cache invalidation
export const QUERY_KEYS = {
  AUTH_USER: ['auth', 'user'],
  AUTH_VALIDATE: ['auth', 'validate'],

  MENUS: ['menus'],
  MENU_BY_ID: (id) => ['menus', id],
  MENU_BY_VENDOR: (vendorId) => ['menus', 'vendor', vendorId],
  MENU_PROMOTED: ['menus', 'promoted'],
  MENU_CATEGORIES: ['menus', 'categories'],

  ORDERS: ['orders'],
  ORDER_BY_ID: (id) => ['orders', id],
  MY_ORDERS: ['orders', 'my-orders'],
  VENDOR_ORDERS: (vendorId) => ['orders', 'vendor', vendorId],

  MY_WALLET: ['wallet', 'my-wallet'],
  WALLET_TRANSACTIONS: ['wallet', 'transactions'],
  WALLET_BALANCE: ['wallet', 'balance'],

  USERS: ['users'],
  USER_BY_ID: (id) => ['users', id],

  ORGANIZATIONS: ['organizations'],
  ORGANIZATION_BY_ID: (id) => ['organizations', id],

  LOCATIONS: ['locations'],
  LOCATION_BY_ID: (id) => ['locations', id],

  OFFICES: ['offices'],
  OFFICE_BY_ID: (id) => ['offices', id],

  CAFETERIAS: ['cafeterias'],
  CAFETERIA_BY_ID: (id) => ['cafeterias', id],
  CAFETERIAS_BY_OFFICE: (officeId) => ['cafeterias', 'office', officeId],

  VENDORS: ['vendors'],
  VENDOR_BY_ID: (id) => ['vendors', id],
  VENDORS_BY_CAFETERIA: (cafeteriaId) => ['vendors', 'cafeteria', cafeteriaId],

  PENDING_APPROVALS: ['admin', 'pending-approvals'],
  ORG_STATS: (orgId) => ['admin', 'org-stats', orgId],
  PLATFORM_STATS: ['admin', 'platform-stats'],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Currency configuration for India
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
};

// Toast notification durations (milliseconds)
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
  WARNING: 4000,
};

// WebSocket configuration
export const WS_ENDPOINTS = {
  ORDERS: '/ws/orders',
  NOTIFICATIONS: '/ws/notifications',
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  OTP_LENGTH: 6,
};

// Route paths - centralized routing configuration
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_ORG: '/register/organization',

  // Employee routes
  EMPLOYEE_HOME: '/employee/menu',
  EMPLOYEE_MENU: '/employee/menu',
  EMPLOYEE_CART: '/employee/cart',
  EMPLOYEE_ORDERS: '/employee/orders',
  EMPLOYEE_ORDER_DETAIL: (orderId) => `/employee/orders/${orderId}`,
  EMPLOYEE_WALLET: '/employee/wallet',
  EMPLOYEE_PROFILE: '/employee/profile',
  EMPLOYEE_TRACKING: '/employee/tracking',
  EMPLOYEE_VENDOR_DETAIL: (vendorId) => `/employee/vendor/${vendorId}`,
  EMPLOYEE_WELCOME: '/employee/welcome',

  // Vendor routes
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_MENU: '/vendor/menu',
  VENDOR_QR_SCANNER: '/vendor/qr-scanner',

  // Org Admin routes
  ORG_ADMIN_DASHBOARD: '/org-admin/dashboard',
  ORG_ADMIN_LOCATIONS: '/org-admin/locations',
  ORG_ADMIN_LOCATION_DETAIL: (locationId) => `/org-admin/locations/${locationId}`,
  ORG_ADMIN_APPROVALS: '/org-admin/approvals',

  // Super Admin routes
  SUPER_ADMIN_DASHBOARD: '/admin/dashboard',
  SUPER_ADMIN_ORGANIZATIONS: '/admin/organizations',
};

// UI Configuration
export const UI_CONFIG = {
  CARD_STYLE: 'bg-surface-container-lowest rounded-xl shadow-card',
  PAGE_PADDING: 'p-4 lg:p-8',
  SECTION_SPACING: 'space-y-10',
};

// Landing page views
export const LANDING_PAGE_VIEW = {
  HOME: 'hero',
  LOGIN: 'login',
  REGISTER: 'register',
  ACC_VERIFY: 'verify',
};

// Helper function to get role-based dashboard path
export const getRoleBasedPath = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return ROUTES.SUPER_ADMIN_DASHBOARD;
    case ROLES.ORG_ADMIN:
      return ROUTES.ORG_ADMIN_DASHBOARD;
    case ROLES.VENDOR:
      return ROUTES.VENDOR_DASHBOARD;
    case ROLES.EMPLOYEE:
      return ROUTES.EMPLOYEE_HOME;
    default:
      return ROUTES.HOME;
  }
};

// Default exports for convenience
export default {
  ROLES,
  LOCL_STRG_KEY,
  AUTH_CONST,
  API_BASE_URL,
  API_PATHS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  USER_STATUS,
  NOTIFICATION_TYPES,
  QUERY_KEYS,
  PAGINATION,
  CURRENCY,
  TOAST_DURATION,
  WS_ENDPOINTS,
  FILE_UPLOAD,
  VALIDATION,
  ROUTES,
  UI_CONFIG,
  LANDING_PAGE_VIEW,
};
