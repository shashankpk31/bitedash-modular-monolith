import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Star,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  IndianRupee,
  Clock,
  Store,
  Wifi,
  WifiOff
} from "lucide-react";
import { useOrderNotifications } from "../../../../context/OrderNotificationContext";
import orderService from "../../services/orderService";
import OrderStepper from "../../components/OrderStepper";
import OrderRatingModal from "../../../shared/components/OrderRatingModal";
import toast from "react-hot-toast";

const Tracking = () => {
  const navigate = useNavigate();
  const { isConnected: wsConnected } = useOrderNotifications();
  const [expandedOrders, setExpandedOrders] = useState({});
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Fetch orders
  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      return await orderService.getMyOrders();
    },
    refetchInterval: autoRefreshEnabled ? 10000 : false, // Auto-refresh every 10 seconds
    retry: 1,
  });

  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleRateOrder = (order) => {
    setSelectedOrder(order);
    setRatingModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      PREPARING: 'bg-blue-100 text-blue-700 border-blue-200',
      READY: 'bg-green-100 text-green-700 border-green-200',
      DELIVERED: 'bg-gray-100 text-gray-700 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Refetch orders when WebSocket receives update
  useEffect(() => {
    if (wsConnected) {
      console.log('[OrderTracking] WebSocket connected - real-time updates enabled');
    }
  }, [wsConnected]);

  // Listen for visibility changes and refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && wsConnected) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wsConnected, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-surface-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600 mt-2">Track your active orders in real-time</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-400" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">
                When you place an order, you can track it here in real-time.
              </p>
              <button
                onClick={() => navigate('/employee/home')}
                className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors"
              >
                Browse Vendors
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 text-sm mt-1">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* WebSocket Connection Status */}
              <div className="flex items-center gap-2 text-sm">
                {wsConnected ? (
                  <>
                    <Wifi className="text-green-500" size={16} />
                    <span className="text-green-600 font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="text-gray-400" size={16} />
                    <span className="text-gray-500 font-medium">Offline</span>
                  </>
                )}
              </div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Auto-refresh</span>
              </label>

              <button
                onClick={() => refetch()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Refresh orders"
              >
                <RefreshCw className="text-gray-600" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-4">
          {orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((order) => {
              const isExpanded = expandedOrders[order.id];
              const canRate = order.status === 'DELIVERED' && !order.rating;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mr-4">
                          <Store className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            Order #{order.orderNumber}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 gap-2">
                            <Clock size={14} />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center text-xl font-bold text-gray-900 mb-2">
                          <IndianRupee size={20} />
                          {order.totalAmount?.toFixed(2)}
                        </div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Stepper */}
                    {order.status !== 'CANCELLED' && (
                      <OrderStepper currentStatus={order.status} />
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => toggleOrderExpanded(order.id)}
                        className="flex-1 py-2 px-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center"
                      >
                        {isExpanded ? (
                          <>
                            Hide Details <ChevronUp className="ml-2" size={16} />
                          </>
                        ) : (
                          <>
                            View Details <ChevronDown className="ml-2" size={16} />
                          </>
                        )}
                      </button>

                      {canRate && (
                        <button
                          onClick={() => handleRateOrder(order)}
                          className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors flex items-center"
                        >
                          <Star className="mr-2" size={16} />
                          Rate Order
                        </button>
                      )}

                      {order.rating && (
                        <div className="flex items-center px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Star className="text-yellow-400 fill-yellow-400 mr-1" size={16} />
                          <span className="font-semibold text-yellow-700">{order.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-3">
                        {order.orderItems?.map((item, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-xl p-4 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.menuItemName || 'Menu Item'}</p>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <div className="flex items-center text-lg font-bold text-gray-900">
                              <IndianRupee size={18} />
                              {(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.feedback && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm font-semibold text-blue-700 mb-1">Your Feedback</p>
                          <p className="text-sm text-blue-600">{order.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Rating Modal */}
      <OrderRatingModal
        isOpen={ratingModalOpen}
        onClose={() => {
          setRatingModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default Tracking;
