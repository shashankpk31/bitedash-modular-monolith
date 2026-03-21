import { useState } from 'react';
import { ShoppingBag, Clock, CheckCircle, X, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../common/components/Button';
import Card, { CardContent } from '../../../common/components/Card';
import { StatusBadge } from '../../../common/components/Badge';
import { ConfirmModal } from '../../../common/components/Modal';
import { ContentLoader } from '../../../common/components/Spinner';
import { useVendorOrders, useUpdateOrderStatus } from '../../../services/queries/order.queries';
import { useAuth } from '../../../contexts';
import { formatCurrency, formatRelativeTime, formatDateTime } from '../../../common/utils';
import { ORDER_STATUS } from '../../../config/constants';
import { useVendorId } from '../hooks/useVendorId';

// Live Orders Page - Real-time order management for vendors
// Why? Kitchen staff need to see incoming orders and update their status
const LiveOrdersPage = () => {
  const { user } = useAuth();

  // Get vendor ID from backend
  const { vendorId, isLoading: vendorIdLoading } = useVendorId();

  const [statusFilter, setStatusFilter] = useState('active'); // active, completed, all
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextStatus, setNextStatus] = useState(null);

  // Fetch orders based on filter
  const params = statusFilter === 'active'
    ? { status: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].join(',') }
    : statusFilter === 'completed'
    ? { status: ORDER_STATUS.COMPLETED }
    : {};

  const { data: orders, isLoading: ordersLoading } = useVendorOrders(vendorId, params);

  const isLoading = vendorIdLoading || ordersLoading;
  const updateStatusMutation = useUpdateOrderStatus();

  // Status filters
  const filters = [
    { value: 'active', label: 'Active', count: orders?.filter(o => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(o.status)).length || 0 },
    { value: 'completed', label: 'Completed', count: orders?.filter(o => o.status === ORDER_STATUS.COMPLETED).length || 0 },
    { value: 'all', label: 'All Orders', count: orders?.length || 0 },
  ];

  // Handle status update
  const handleStatusUpdate = (order, newStatus) => {
    setSelectedOrder(order);
    setNextStatus(newStatus);
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedOrder && nextStatus) {
      updateStatusMutation.mutate(
        { orderId: selectedOrder.id, status: nextStatus },
        {
          onSuccess: () => {
            setShowConfirmModal(false);
            setSelectedOrder(null);
            setNextStatus(null);
          },
        }
      );
    }
  };

  // Get next action button for order
  const getOrderActions = (order) => {
    switch (order.status) {
      case ORDER_STATUS.PENDING:
        return (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle size={16} />}
              onClick={() => handleStatusUpdate(order, ORDER_STATUS.CONFIRMED)}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<X size={16} />}
              onClick={() => handleStatusUpdate(order, ORDER_STATUS.CANCELLED)}
              className="border-error text-error hover:bg-error/10"
            >
              Reject
            </Button>
          </div>
        );

      case ORDER_STATUS.CONFIRMED:
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusUpdate(order, ORDER_STATUS.PREPARING)}
          >
            Start Preparing
          </Button>
        );

      case ORDER_STATUS.PREPARING:
        return (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleStatusUpdate(order, ORDER_STATUS.READY)}
          >
            Mark Ready
          </Button>
        );

      case ORDER_STATUS.READY:
        return (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleStatusUpdate(order, ORDER_STATUS.PICKED_UP)}
          >
            Mark Picked Up
          </Button>
        );

      case ORDER_STATUS.PICKED_UP:
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusUpdate(order, ORDER_STATUS.COMPLETED)}
          >
            Complete
          </Button>
        );

      default:
        return null;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'bg-yellow-500/10 text-yellow-600';
      case ORDER_STATUS.CONFIRMED:
      case ORDER_STATUS.PREPARING:
        return 'bg-primary/10 text-primary';
      case ORDER_STATUS.READY:
        return 'bg-green-500/10 text-green-600';
      case ORDER_STATUS.PICKED_UP:
      case ORDER_STATUS.COMPLETED:
        return 'bg-green-500/10 text-green-600';
      case ORDER_STATUS.CANCELLED:
        return 'bg-error/10 text-error';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-outline-variant/15 bg-surface-container-low">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-headline text-display-sm text-on-surface">Live Orders</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Manage incoming orders in real-time
            </p>
          </div>

          {/* Status filters */}
          <div className="flex gap-2">
            {filters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-on-primary/20 text-xs">
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Loading */}
        {isLoading && <ContentLoader message="Loading orders..." />}

        {/* Empty State */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
              <ShoppingBag size={40} className="text-on-surface-variant opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-headline-sm text-on-surface">
                {statusFilter === 'active' ? 'No Active Orders' : 'No Orders Found'}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                {statusFilter === 'active'
                  ? 'New orders will appear here when customers place them'
                  : 'Try selecting a different filter'}
              </p>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        {!isLoading && orders && orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {orders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="h-full hover:shadow-ambient transition-shadow">
                    <CardContent>
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-headline text-headline-sm text-on-surface">
                              Order #{order.id}
                            </div>
                            <div className="text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
                              <Clock size={12} />
                              {formatRelativeTime(order.createdAt)}
                            </div>
                          </div>
                          <StatusBadge status={order.status} size="sm" />
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-2">
                          <div className="text-label-md text-on-surface font-semibold">
                            {order.customerName || 'Customer'}
                          </div>
                          {order.customerPhone && (
                            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                              <Phone size={14} />
                              {order.customerPhone}
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <div className="text-label-md text-on-surface-variant uppercase">Items</div>
                          <div className="space-y-1">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-body-sm">
                                <span className="text-on-surface">
                                  {item.quantity}x {item.itemName || item.name}
                                </span>
                                <span className="text-on-surface-variant">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="pt-3 border-t border-outline-variant/15">
                          <div className="flex items-center justify-between">
                            <span className="font-headline text-body-lg text-on-surface">Total</span>
                            <span className="font-headline text-headline-md text-primary">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* ETA */}
                        {order.estimatedTime && order.status !== ORDER_STATUS.COMPLETED && (
                          <div className={`p-3 rounded-lg ${getStatusColor(order.status)}`}>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span className="text-label-md font-semibold">
                                {order.status === ORDER_STATUS.READY
                                  ? 'Ready for pickup'
                                  : `ETA: ${order.estimatedTime} min`}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {getOrderActions(order)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedOrder(null);
          setNextStatus(null);
        }}
        onConfirm={confirmStatusUpdate}
        loading={updateStatusMutation.isPending}
        title="Update Order Status?"
        message={`Are you sure you want to update order #${selectedOrder?.id} to ${nextStatus?.replace('_', ' ')}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        variant={nextStatus === ORDER_STATUS.CANCELLED ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default LiveOrdersPage;
