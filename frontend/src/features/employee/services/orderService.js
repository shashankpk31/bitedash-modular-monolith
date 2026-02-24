import api from '../../../api/axiosInstance';

const orderService = {
  // Create Order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response;
  },

  // Get My Orders
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response;
  },

  // Get Order Details
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  },

  // Get Order History (status changes)
  getOrderHistory: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/history`);
    return response;
  },

  // Rate Order
  rateOrder: async (orderId, ratingData) => {
    // ratingData = { rating: 1-5, feedback: "optional text" }
    const response = await api.post(`/orders/${orderId}/rate`, ratingData);
    return response;
  },

  // Get Order by QR Code (for tracking)
  getOrderByQRCode: async (qrCodeData) => {
    const response = await api.get(`/orders/qr/${qrCodeData}`);
    return response;
  },
};

export default orderService;
