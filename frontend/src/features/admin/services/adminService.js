import api from '../../../api/axiosInstance';
import { API_PATHS } from '../../../config/constants';

export const adminService = {
  
  getDashboardStats: async () => {
    return await api.get(`${API_PATHS.ORG_SERVICE}/admin/stats`);
  },

  getAllOrganizations: async () => {
    return await api.get(`${API_PATHS.ORG_SERVICE}/public`);
  },

  getOrganizationById: async (orgId) => {
    return await api.get(`${API_PATHS.ORG_SERVICE}/${orgId}`);
  },

  createOrganization: async (orgData) => {
    return await api.post(`${API_PATHS.ORG_SERVICE}`, orgData);
  },

  createOrgAdmin: async (adminData) => {
    return await api.post(`${API_PATHS.IDENTITY_AUTH}/register/org-admin`, adminData);
  },

  createCity: async (cityData) => {
    return await api.post(`${API_PATHS.VENDOR_SERVICE}/admin/cities`, cityData);
  },

  getPendingApprovals: async () => {
    return await api.get(`${API_PATHS.IDENTITY_AUTH}/admin/pending-approvals`);
  },

  updateUserStatus: async (userId, status) => {
    return await api.put(`${API_PATHS.IDENTITY_AUTH}/admin/users/${userId}/status`, { status });
  },

  getPlatformRevenueStats: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    // Convert Date objects to ISO string format if provided
    if (startDate) {
      let dateStr;
      if (startDate instanceof Date) {
        dateStr = startDate.toISOString();
      } else if (typeof startDate === 'string') {
        dateStr = startDate;
      } else {
        // Skip invalid date formats
        console.warn('Invalid startDate format:', startDate);
        dateStr = null;
      }
      if (dateStr) {
        params.append('startDate', dateStr);
      }
    }
    if (endDate) {
      let dateStr;
      if (endDate instanceof Date) {
        dateStr = endDate.toISOString();
      } else if (typeof endDate === 'string') {
        dateStr = endDate;
      } else {
        // Skip invalid date formats
        console.warn('Invalid endDate format:', endDate);
        dateStr = null;
      }
      if (dateStr) {
        params.append('endDate', dateStr);
      }
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/revenue/platform/stats${query}`);
  },

  getDailyRevenue: async (daysOrDateRange = 30) => {
    // If it's a number (days), use days parameter
    if (typeof daysOrDateRange === 'number') {
      return await api.get(`/revenue/platform/daily?days=${daysOrDateRange}`);
    }
    // If it's a date range object with startDate/endDate, convert to ISO strings
    if (daysOrDateRange && typeof daysOrDateRange === 'object') {
      const params = new URLSearchParams();
      if (daysOrDateRange.startDate) {
        let dateStr;
        if (daysOrDateRange.startDate instanceof Date) {
          dateStr = daysOrDateRange.startDate.toISOString();
        } else if (typeof daysOrDateRange.startDate === 'string') {
          dateStr = daysOrDateRange.startDate;
        } else {
          console.warn('Invalid startDate format:', daysOrDateRange.startDate);
        }
        if (dateStr) {
          params.append('startDate', dateStr);
        }
      }
      if (daysOrDateRange.endDate) {
        let dateStr;
        if (daysOrDateRange.endDate instanceof Date) {
          dateStr = daysOrDateRange.endDate.toISOString();
        } else if (typeof daysOrDateRange.endDate === 'string') {
          dateStr = daysOrDateRange.endDate;
        } else {
          console.warn('Invalid endDate format:', daysOrDateRange.endDate);
        }
        if (dateStr) {
          params.append('endDate', dateStr);
        }
      }
      if (params.toString()) {
        return await api.get(`/revenue/platform/daily?${params.toString()}`);
      }
    }
    // Default to 30 days
    return await api.get(`/revenue/platform/daily?days=30`);
  }
};