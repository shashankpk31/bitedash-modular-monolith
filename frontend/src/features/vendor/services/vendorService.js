import api from '../../../api/axiosInstance';

const vendorService = {
  // Menu Items Management
  getMyMenuItems: async (vendorId) => {
    // Backend expects: GET /menu/vendor/{vendorId}
    const response = await api.get(`/menu/vendor/${vendorId}`);
    return response;
  },

  getMenuItemById: async (id) => {
    const response = await api.get(`/menu/items/${id}`);
    return response;
  },

  createMenuItem: async (menuItemData) => {
    // Backend auto-fills vendorId from UserContext
    const response = await api.post('/menu/items', menuItemData);
    return response;
  },

  updateMenuItem: async (id, menuItemData) => {
    // Backend auto-fills vendorId from UserContext
    const response = await api.put(`/menu/items/${id}`, menuItemData);
    return response;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu/items/${id}`);
    return response;
  },

  // Categories Management
  getMyCategories: async (vendorId, includeItems = false) => {
    // Backend expects: GET /menu/categories/vendor/{vendorId}
    const response = await api.get(`/menu/categories/vendor/${vendorId}?includeItems=${includeItems}`);
    return response;
  },

  createCategory: async (categoryData) => {
    // Backend auto-fills vendorId from UserContext
    const response = await api.post('/menu/categories', categoryData);
    return response;
  },

  updateCategory: async (id, categoryData) => {
    // Backend auto-fills vendorId from UserContext
    const response = await api.put(`/menu/categories/${id}`, categoryData);
    return response;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/menu/categories/${id}`);
    return response;
  },

  // Orders Management
  getMyOrders: async (vendorId) => {
    // Backend expects: GET /orders/vendor/{vendorId}
    const response = await api.get(`/orders/vendor/${vendorId}`);
    return response;
  },

  updateOrderStatus: async (orderId, status, remarks = null) => {
    // Backend expects: PUT /orders/{id}/status?status={status}&remarks={remarks}
    const params = new URLSearchParams({ status });
    if (remarks) params.append('remarks', remarks);
    const response = await api.put(`/orders/${orderId}/status?${params}`);
    return response;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  },

  getOrderByQRCode: async (qrCodeData) => {
    // Backend expects: GET /orders/qr/{qrCodeData}
    const response = await api.get(`/orders/qr/${qrCodeData}`);
    return response;
  },

  getOrderHistory: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/history`);
    return response;
  },

  // Rating & Analytics
  getMyRating: async (vendorId) => {
    // Backend expects: GET /orders/vendor/{vendorId}/rating
    const response = await api.get(`/orders/vendor/${vendorId}/rating`);
    return response;
  },
};

export default vendorService;
