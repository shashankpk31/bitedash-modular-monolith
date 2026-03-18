import api from '../../../api/axiosInstance';

const catalogService = {
  // Browse Menu Items
  getPromotedItems: async () => {
    const response = await api.get('/menus/promoted');
    return response;
  },

  getPopularItems: async () => {
    const response = await api.get('/menus/popular');
    return response;
  },

  searchMenuItems: async (keyword) => {
    const response = await api.get(`/menus/search?keyword=${encodeURIComponent(keyword)}`);
    return response;
  },

  getMenuItemById: async (itemId) => {
    const response = await api.get(`/menus/items/${itemId}`);
    return response;
  },

  // Vendor Menu
  getVendorMenuItems: async (vendorId) => {
    const response = await api.get(`/menus/vendor/${vendorId}`);
    return response;
  },

  getVendorCategories: async (vendorId, includeItems = true) => {
    const response = await api.get(`/menus/categories/vendor/${vendorId}?includeItems=${includeItems}`);
    return response;
  },

  getCategoryById: async (categoryId, includeItems = true) => {
    const response = await api.get(`/menus/categories/${categoryId}?includeItems=${includeItems}`);
    return response;
  },

  // Vendor Info & Rating
  getVendorRating: async (vendorId) => {
    const response = await api.get(`/orders/vendor/${vendorId}/rating`);
    return response;
  },
};

export default catalogService;
