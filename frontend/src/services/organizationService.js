import api from '../api/axiosInstance';

export const organizationService = {
  
  getAllOrganizations: async () => {
    const response = await api.get('/organization/public');
    return response;
  },

  getOrganizationById: async (id) => {
    const response = await api.get(`/organization/${id}`);
    return response;
  }
};
