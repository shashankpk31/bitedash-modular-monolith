import api from '../api/axiosInstance';

const orderService = {
  // Create Order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response;
  },

  // Get Order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  },

  // Get Order by QR Code
  getOrderByQRCode: async (qrCodeData) => {
    const response = await api.get(`/orders/qr/${qrCodeData}`);
    return response;
  },

  // Get My Orders (Employee)
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response;
  },

  // Get Vendor Orders
  getVendorOrders: async (vendorId) => {
    const response = await api.get(`/orders/vendor/${vendorId}`);
    return response;
  },

  // Get Order History (Status changes)
  getOrderHistory: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/history`);
    return response;
  },

  // Update Order Status (Vendor only)
  updateOrderStatus: async (orderId, status, remarks = null) => {
    const response = await api.put(`/orders/${orderId}/status`, null, {
      params: { status, remarks }
    });
    return response;
  },

  // Rate Order (Employee only)
  rateOrder: async (orderId, rating, comment = null) => {
    const response = await api.post(`/orders/${orderId}/rate`, {
      rating,
      comment
    });
    return response;
  },

  // Get Vendor Average Rating
  getVendorRating: async (vendorId) => {
    const response = await api.get(`/orders/vendor/${vendorId}/rating`);
    return response;
  },
};

export default orderService;
