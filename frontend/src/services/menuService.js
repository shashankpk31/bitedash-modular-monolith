import api from '../api/axiosInstance';

const menuService = {
  // Get Menu Items by Vendor
  getMenuItemsByVendor: async (vendorId) => {
    const response = await api.get(`/menus/vendor/${vendorId}`);
    return response;
  },

  // Get Menu Item by ID
  getMenuItemById: async (itemId) => {
    const response = await api.get(`/menus/items/${itemId}`);
    return response;
  },

  // Get Promoted Items (Today's Specials)
  getPromotedItems: async () => {
    const response = await api.get('/menus/promoted');
    return response;
  },

  // Get Popular Items
  getPopularItems: async () => {
    const response = await api.get('/menus/popular');
    return response;
  },

  // Search Menu Items
  searchMenuItems: async (keyword) => {
    const response = await api.get('/menus/search', {
      params: { keyword }
    });
    return response;
  },

  // Create Menu Item (Vendor only)
  createMenuItem: async (menuItemData) => {
    const response = await api.post('/menus/items', menuItemData);
    return response;
  },

  // Update Menu Item (Vendor only)
  updateMenuItem: async (itemId, menuItemData) => {
    const response = await api.put(`/menus/items/${itemId}`, menuItemData);
    return response;
  },

  // Delete Menu Item (Vendor only)
  deleteMenuItem: async (itemId) => {
    const response = await api.delete(`/menus/items/${itemId}`);
    return response;
  },

  // Get Categories by Vendor
  getCategoriesByVendor: async (vendorId, includeItems = false) => {
    const response = await api.get(`/menus/categories/vendor/${vendorId}`, {
      params: { includeItems }
    });
    return response;
  },

  // Get Category by ID
  getCategoryById: async (categoryId, includeItems = false) => {
    const response = await api.get(`/menus/categories/${categoryId}`, {
      params: { includeItems }
    });
    return response;
  },

  // Create Category (Vendor only)
  createCategory: async (categoryData) => {
    const response = await api.post('/menus/categories', categoryData);
    return response;
  },

  // Update Category (Vendor only)
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/menus/categories/${categoryId}`, categoryData);
    return response;
  },

  // Delete Category (Vendor only)
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/menus/categories/${categoryId}`);
    return response;
  },
};

export default menuService;
