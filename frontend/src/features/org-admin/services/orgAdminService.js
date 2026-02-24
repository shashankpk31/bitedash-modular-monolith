import api from '../../../api/axiosInstance';
import { API_PATHS } from '../../../config/constants';

export const orgAdminService = {
  getDashboardStats: async () => {
    return await api.get(`/organisation/admin/stats`);
  },

  getPendingApprovals: async () => {
    return await api.get(`${API_PATHS.IDENTITY_AUTH}/admin/pending-approvals`);
  },

  updateUserStatus: async (userId, status) => {
    return await api.put(`${API_PATHS.IDENTITY_AUTH}/admin/users/${userId}/status`, { status });
  },

  getAllLocations: async (orgId) => {
    return await api.get(`/organisation/locations/org/${orgId}`);
  },

  createLocation: async (locationData) => {
    return await api.post(`/organisation/locations`, locationData);
  },

  updateLocation: async (locationId, locationData) => {
    return await api.put(`/organisation/locations/${locationId}`, locationData);
  },

  deleteLocation: async (locationId) => {
    return await api.delete(`/organisation/locations/${locationId}`);
  },

  getOfficesByLocation: async (locationId) => {
    return await api.get(`/organisation/offices/location/${locationId}`);
  },

  createOffice: async (officeData) => {
    return await api.post(`/organisation/offices`, officeData);
  },

  updateOffice: async (officeId, officeData) => {
    return await api.put(`/organisation/offices/${officeId}`, officeData);
  },

  deleteOffice: async (officeId) => {
    return await api.delete(`/organisation/offices/${officeId}`);
  },

  getCafeteriasByOffice: async (officeId) => {
    return await api.get(`/organisation/cafeterias/office/${officeId}`);
  },

  createCafeteria: async (cafeteriaData) => {
    return await api.post(`/organisation/cafeterias`, cafeteriaData);
  },

  toggleCafeteriaStatus: async (cafeteriaId, isActive) => {
    return await api.put(`/organisation/cafeterias/${cafeteriaId}/status`, null, {
      params: { active: isActive }
    });
  },

  updateCafeteria: async (cafeteriaId, cafeteriaData) => {
    return await api.put(`/organisation/cafeterias/${cafeteriaId}`, cafeteriaData);
  },

  deleteCafeteria: async (cafeteriaId) => {
    return await api.delete(`/organisation/cafeterias/${cafeteriaId}`);
  },
};
