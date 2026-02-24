import axiosInstance from '../../../api/axiosInstance';

export const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);  
    return response;
  },

  verifyAccount: async (identifier, otp) => {
    const response = await axiosInstance.post(`/auth/verify?identifier=${identifier}&otp=${otp}`);  
    return response;
  },

  resendOtp: async (identifier, type) => {
    const response = await axiosInstance.post(`/auth/resend-otp?identifier=${identifier}&type=${type}`);
    return response;
  }
};