import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShoppingBag, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import { StatusBadge } from '../../../common/components/Badge';
import { ContentLoader } from '../../../common/components/Spinner';
import { useMyOrders } from '../../../services/queries/order.queries';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../../common/utils';
import { ORDER_STATUS } from '../../../config/constants';

// Order History Page - Shows past orders with filters
// Why? Allows users to track previous orders and reorder
const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch orders with filter
  const params = statusFilter !== 'all' ? { status: statusFilter } : {};
  const { data: orders, isLoading } = useMyOrders(params);

  // Status filter options
  const filters = [
    { value: 'all', label: 'All Orders' },
    { value: ORDER_STATUS.PENDING, label: 'Pending' },
    { value: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
    { value: ORDER_STATUS.PREPARING, label: 'Preparing' },
    { value: ORDER_STATUS.READY, label: 'Ready' },
    { value: ORDER_STATUS.COMPLETED, label: 'Completed' },
    { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/15">
        <h1 className="font-headline text-display-sm text-on-surface">Order History</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          View and track your orders
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-outline-variant/15">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-on-surface-variant" />
          <span className="text-label-md text-on-surface-variant">Filter by status</span>
        </div>
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {filters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === filter.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
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
                {statusFilter === 'all' ? 'No Orders Yet' : 'No Orders Found'}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'Start ordering delicious food from your favorite vendors'
                  : 'Try selecting a different status filter'}
              </p>
            </div>
            {statusFilter === 'all' && (
              <Button
                variant="primary"
                onClick={() => navigate('/employee/menu')}
              >
                Browse Menu
              </Button>
            )}
          </div>
        )}

        {/* Orders */}
        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map(order => (
              <motion.button
                key={order.id}
                onClick={() => navigate(`/employee/orders/${order.id}`)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-card hover:shadow-ambient transition-all text-left"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-headline text-body-lg text-on-surface">
                        Order #{order.id}
                      </span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <div className="text-label-sm text-on-surface-variant">
                      {formatRelativeTime(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-headline text-headline-sm text-primary">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    {order.itemCount && (
                      <div className="text-label-sm text-on-surface-variant mt-1">
                        {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <ShoppingBag size={14} />
                  <span>{order.vendorName || 'Vendor'}</span>
                </div>

                {/* ETA (if applicable) */}
                {(order.status === ORDER_STATUS.PREPARING || order.status === ORDER_STATUS.READY) && order.estimatedTime && (
                  <div className="mt-3 px-3 py-2 bg-primary/10 rounded-lg flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    <span className="text-label-sm text-primary font-semibold">
                      {order.status === ORDER_STATUS.READY
                        ? 'Ready for pickup!'
                        : `Ready in ~${order.estimatedTime} min`}
                    </span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
