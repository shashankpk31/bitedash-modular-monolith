import api from '../../../api/axiosInstance';

const catalogService = {
  // Browse Menu Items
  getPromotedItems: async () => {
    const response = await api.get('/menu/promoted');
    return response;
  },

  getPopularItems: async () => {
    const response = await api.get('/menu/popular');
    return response;
  },

  searchMenuItems: async (keyword) => {
    const response = await api.get(`/menu/search?keyword=${encodeURIComponent(keyword)}`);
    return response;
  },

  getMenuItemById: async (itemId) => {
    const response = await api.get(`/menu/items/${itemId}`);
    return response;
  },

  // Vendor Menu
  getVendorMenuItems: async (vendorId) => {
    const response = await api.get(`/menu/vendor/${vendorId}`);
    return response;
  },

  getVendorCategories: async (vendorId, includeItems = true) => {
    const response = await api.get(`/menu/categories/vendor/${vendorId}?includeItems=${includeItems}`);
    return response;
  },

  getCategoryById: async (categoryId, includeItems = true) => {
    const response = await api.get(`/menu/categories/${categoryId}?includeItems=${includeItems}`);
    return response;
  },

  // Vendor Info & Rating
  getVendorRating: async (vendorId) => {
    const response = await api.get(`/orders/vendor/${vendorId}/rating`);
    return response;
  },
};

export default catalogService;
