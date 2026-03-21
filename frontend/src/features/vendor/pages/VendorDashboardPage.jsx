import { useState } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Star, Clock, AlertCircle, Utensils, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Card, { CardHeader, CardTitle, CardContent } from '../../../common/components/Card';
import Badge, { StatusBadge } from '../../../common/components/Badge';
import { ContentLoader } from '../../../common/components/Spinner';
import { useVendorOrders } from '../../../services/queries/order.queries';
import { useAuth } from '../../../contexts';
import { formatCurrency, formatRelativeTime } from '../../../common/utils';
import { ORDER_STATUS, QUERY_KEYS } from '../../../config/constants';
import { getMyVendorStats } from '../../../services/api/organization.api';
import { useVendorId } from '../hooks/useVendorId';

// Vendor Dashboard - Overview and analytics
// Why? Vendors need quick insights into their business performance
const VendorDashboardPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('today'); // today, week, month

  // Get vendor ID from backend
  const { vendorId, isLoading: vendorIdLoading } = useVendorId();

  const { data: vendorStats, isLoading: statsLoading } = useQuery({
    queryKey: [QUERY_KEYS.VENDORS, 'my-stats'],
    queryFn: getMyVendorStats,
  });

  // Fetch vendor's orders
  const { data: orders, isLoading: ordersLoading } = useVendorOrders(vendorId, { timeRange });

  const isLoading = vendorIdLoading || statsLoading || ordersLoading;

  // Use stats from backend API
  const stats = vendorStats || {
    totalOrders: 0,
    activeOrders: 0,
    completedToday: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    rating: 0,
    totalMenuItems: 0,
    activeMenuItems: 0,
  };

  // Time range filters
  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-headline text-display-sm text-on-surface">Dashboard</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Overview of your business performance
          </p>
        </div>

        {/* Time range filter */}
        <div className="flex gap-2">
          {timeRanges.map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-colors ${
                timeRange === range.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <ContentLoader message="Loading dashboard..." />}

      {!isLoading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Total Orders</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.totalOrders || 0}</h2>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      {stats.completedToday || 0} completed today
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Active Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Active Orders</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.activeOrders || 0}</h2>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      Needs attention
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Clock size={24} className="text-yellow-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Revenue</p>
                    <h2 className="font-headline text-display-sm text-on-surface">
                      {formatCurrency(stats.totalRevenue || 0)}
                    </h2>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      Avg: {formatCurrency(stats.avgOrderValue || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Rating</p>
                    <h2 className="font-headline text-display-sm text-on-surface">
                      {stats.rating ? `${stats.rating.toFixed(1)} ⭐` : 'N/A'}
                    </h2>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      {stats.totalMenuItems || 0} menu items
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Star size={24} className="text-yellow-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {(!orders || orders.length === 0) && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
                <ShoppingBag size={32} className="text-on-surface-variant opacity-40" />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-headline-sm text-on-surface">No Orders Yet</h3>
                <p className="text-body-md text-on-surface-variant">
                  Orders will appear here when customers place them
                </p>
              </div>
              </div>
            )}

            {orders && orders.length > 0 && (
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                      <ShoppingBag size={20} className="text-on-surface-variant" />
                    </div>
                    <div>
                      <div className="font-headline text-body-md text-on-surface">
                        Order #{order.id}
                      </div>
                      <div className="text-label-sm text-on-surface-variant">
                        {formatRelativeTime(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-headline text-body-md text-on-surface">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-label-sm text-on-surface-variant">
                        {order.itemCount || 0} items
                      </div>
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                </div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-ambient transition-shadow">
          <CardContent>
            <div className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-body-lg text-on-surface">View Live Orders</h3>
                <p className="text-label-sm text-on-surface-variant">Manage incoming orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-ambient transition-shadow">
          <CardContent>
            <div className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Utensils size={24} className="text-secondary" />
              </div>
              <div>
                <h3 className="font-headline text-body-lg text-on-surface">Manage Menu</h3>
                <p className="text-label-sm text-on-surface-variant">Update your menu items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-ambient transition-shadow">
          <CardContent>
            <div className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                <Package size={24} className="text-tertiary" />
              </div>
              <div>
                <h3 className="font-headline text-body-lg text-on-surface">Check Inventory</h3>
                <p className="text-label-sm text-on-surface-variant">Manage stock levels</p>
              </div>
            </div>
            </CardContent>
          </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorDashboardPage;
