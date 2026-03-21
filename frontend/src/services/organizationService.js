import api from '../api/axiosInstance';

export const organizationService = {

  getAllOrganizations: async () => {
    const response = await api.get('/organization/public');
    return response;
  },

  getOrganizationById: async (id) => {
    const response = await api.get(`/organization/${id}`);
    return response;
  },

  // Location endpoints
  getLocationsByOrg: async (orgId) => {
    const response = await api.get(`/organisation/locations/org/${orgId}`);
    return response;
  },

  // Office endpoints
  getOfficesByLocation: async (locationId) => {
    const response = await api.get(`/organisation/offices/location/${locationId}`);
    return response;
  },

  // Cafeteria endpoints
  getCafeteriasByOffice: async (officeId) => {
    const response = await api.get(`/organisation/cafeterias/office/${officeId}`);
    return response;
  },

  // Vendor endpoints
  getVendorsByCafeteria: async (cafeteriaId) => {
    const response = await api.get(`/organisation/vendors/stalls/cafeteria/${cafeteriaId}`);
    return response;
  },

  // Super Admin stats
  getSuperAdminStats: async () => {
    const response = await api.get('/organization/super-admin/stats');
    return response;
  },

  // Org Admin stats
  getOrgAdminStats: async () => {
    const response = await api.get('/organisation/admin/dashboard');
    return response;
  },

  // Pending approvals (when backend endpoint is ready)
  getPendingApprovals: async () => {
    const response = await api.get('/organisation/admin/pending-approvals');
    return response;
  }
};
