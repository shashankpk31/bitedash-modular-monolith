import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  Clock,
  ChefHat,
  Package,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  User,
  QrCode,
  Wifi,
  WifiOff
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { useOrderNotifications } from "../../../../context/OrderNotificationContext";
import vendorService from "../../services/vendorService";
import QRCodeDisplay from "../../../../components/ui/QRCodeDisplay";
import Modal from "../../../../components/ui/Modal";
import toast from "react-hot-toast";

const LiveOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isConnected: wsConnected } = useOrderNotifications();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedQROrder, setSelectedQROrder] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Fetch orders
  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vendor-orders', user?.id],
    queryFn: async () => {
      return await vendorService.getMyOrders(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: autoRefreshEnabled ? 5000 : false, // Auto-refresh every 5 seconds
    retry: 1,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, remarks }) => {
      return await vendorService.updateOrderStatus(orderId, status, remarks);
    },
    onSuccess: () => {
      toast.success('Order status updated!');
      queryClient.invalidateQueries(['vendor-orders']);
    },
    onError: (error) => {
      toast.error(error || 'Failed to update order status');
    },
  });

  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    if (window.confirm(`Update order status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

  const handleShowQR = (order) => {
    setSelectedQROrder(order);
    setShowQRModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
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

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: 'New',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        nextStatus: 'PREPARING',
        nextLabel: 'Start Preparing'
      },
      PREPARING: {
        label: 'Preparing',
        icon: ChefHat,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        nextStatus: 'READY',
        nextLabel: 'Mark as Ready'
      },
      READY: {
        label: 'Ready',
        icon: Package,
        color: 'bg-green-100 text-green-700 border-green-200',
        nextStatus: 'DELIVERED',
        nextLabel: 'Mark as Delivered'
      },
      DELIVERED: {
        label: 'Delivered',
        icon: CheckCircle2,
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        nextStatus: null,
        nextLabel: null
      },
    };
    return configs[status] || configs.PENDING;
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'New' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const filteredOrders = orders?.filter(order => {
    if (statusFilter === 'ALL') return true;
    return order.status === statusFilter;
  }) || [];

  const getOrderCount = (status) => {
    if (status === 'ALL') return orders?.length || 0;
    return orders?.filter(o => o.status === status).length || 0;
  };

  // Refetch orders when WebSocket receives update
  useEffect(() => {
    if (wsConnected) {
      // WebSocket is connected, we'll get real-time updates
      // The OrderNotificationContext will trigger refetch via toast notifications
      console.log('[LiveOrders] WebSocket connected - real-time updates enabled');
    }
  }, [wsConnected]);

  // Listen for notification events and refetch orders
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
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Live Orders</h1>
            <p className="text-gray-600 mt-2">
              Real-time order management and tracking
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="text-brand-primary" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Orders Yet
              </h2>
              <p className="text-gray-600">
                When you receive orders, they'll appear here for real-time tracking and management.
              </p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
              <p className="text-gray-600 text-sm mt-1">
                {orders.length} total {orders.length === 1 ? 'order' : 'orders'}
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

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                }`}
              >
                {tab.label} ({getOrderCount(tab.key)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <ClipboardList className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} orders
            </h3>
            <p className="text-gray-600">
              {statusFilter !== 'ALL'
                ? `You don't have any ${statusFilter.toLowerCase()} orders at the moment.`
                : 'All orders have been completed.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(order => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = expandedOrders[order.id];

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${statusConfig.color}`}>
                            <StatusIcon size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              Order #{order.orderNumber}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 gap-3">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatDate(order.createdAt)}
                              </div>
                              {order.userId && (
                                <div className="flex items-center gap-1">
                                  <User size={14} />
                                  Customer ID: {order.userId}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center text-xl font-bold text-gray-900 mb-2">
                            <IndianRupee size={20} />
                            {order.totalAmount?.toFixed(2)}
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => toggleOrderExpanded(order.id)}
                          className="flex-1 py-2 px-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center"
                        >
                          {isExpanded ? (
                            <>
                              Hide Items <ChevronUp className="ml-2" size={16} />
                            </>
                          ) : (
                            <>
                              View Items <ChevronDown className="ml-2" size={16} />
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleShowQR(order)}
                          className="py-2 px-4 border-2 border-brand-primary text-brand-primary font-semibold rounded-xl hover:bg-orange-50 transition-colors flex items-center"
                        >
                          <QrCode className="mr-2" size={16} />
                          QR Code
                        </button>

                        {statusConfig.nextStatus && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, statusConfig.nextStatus)}
                            disabled={updateStatusMutation.isPending}
                            className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="animate-spin mr-2" size={16} />
                            ) : null}
                            {statusConfig.nextLabel}
                          </button>
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
                                <p className="font-semibold text-gray-900">
                                  {item.menuItemName || 'Menu Item'}
                                </p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">
                                  {formatCurrency(item.price)} × {item.quantity}
                                </p>
                                <div className="flex items-center text-lg font-bold text-gray-900">
                                  <IndianRupee size={18} />
                                  {(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {order.rating && (
                          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <p className="text-sm font-semibold text-yellow-700 mb-1">
                              Customer Rating: ⭐ {order.rating}
                            </p>
                            {order.feedback && (
                              <p className="text-sm text-yellow-600">{order.feedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedQROrder(null);
        }}
        title="Order QR Code"
      >
        {selectedQROrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{selectedQROrder.orderNumber}</p>
            </div>

            <QRCodeDisplay
              qrCodeData={selectedQROrder.qrCodeData}
              orderNumber={selectedQROrder.orderNumber}
              size={250}
            />

            <p className="text-xs text-gray-500 text-center">
              Customer will present this QR code for order verification
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LiveOrders;
