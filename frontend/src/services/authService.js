import api from '../api/axiosInstance';

const authService = {
  // Login
  login: async (formdata) => {    
    const response = await api.post('/auth/login', formdata);
    return response;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Register Organization Admin (Super Admin only)
  registerOrgAdmin: async (orgAdminData) => {
    const response = await api.post('/auth/register/org-admin', orgAdminData);
    return response;
  },

  // Verify Account (OTP verification)
  verify: async (identifier, otp) => {
    const response = await api.post('/auth/verify', null, {
      params: { identifier, otp }
    });
    return response;
  },

  // Resend OTP
  resendOtp: async (identifier, type = 'EMAIL') => {
    const response = await api.post('/auth/resend-otp', null, {
      params: { identifier, type }
    });
    return response;
  },

  // Validate Token
  validateToken: async (token) => {
    const response = await api.get('/auth/validate', {
      params: { token }
    });
    return response;
  },

  // Get Pending Approvals (Admin only)
  getPendingApprovals: async () => {
    const response = await api.get('/auth/admin/pending-approvals');
    return response;
  },

  // Update User Status (Admin only)
  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/auth/admin/users/${userId}/status`, { status });
    return response;
  },
};

export default authService;
