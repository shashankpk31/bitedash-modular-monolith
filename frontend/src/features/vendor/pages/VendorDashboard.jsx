import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import Icon from '../../../components/ui/Icon';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Card from '../../../components/ui/Card';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import vendorService from '../../../features/vendor/services/vendorService';
import { foodPlaceholder } from '../../../utils/placeholders';

const VendorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [storeOnline, setStoreOnline] = useState(true);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['vendor-orders', user?.id],
    queryFn: () => vendorService.getMyOrders(user.id),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => vendorService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendor-orders']);
      toast.success('Order status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Play sound for new orders
  useEffect(() => {
    const newOrders = orders.filter(o => o.status === 'NEW');
    if (newOrders.length > 0) {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    }
  }, [orders]);

  const liveOrders = orders.filter(o => ['NEW', 'PREPARING', 'READY'].includes(o.status));
  const todayOrders = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today;
  });

  const totalSales = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'NEW').length;

  const getStatusColor = (status) => {
    const colors = {
      NEW: 'text-primary',
      PREPARING: 'text-warning',
      READY: 'text-success',
    };
    return colors[status] || 'text-gray-500';
  };

  const getElapsedTime = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-6">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="restaurant" className="text-primary" />
              <span className="text-sm text-gray-500 dark:text-gray-400">BiteDash Vendor</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user?.vendorName || 'Downtown Kitchen'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${storeOnline ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              <div className={`w-2 h-2 rounded-full ${storeOnline ? 'bg-success' : 'bg-error'} animate-pulse`} />
              <span className="text-sm font-semibold">{storeOnline ? 'Store Online' : 'Store Offline'}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Real-time store performance and order tracking
        </p>
      </header>

      {/* Metrics */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ORDERS TODAY</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{todayOrders.length}</p>
              <p className="text-sm text-success mt-1">↑ 12%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="shopping_bag" className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">TOTAL SALES</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalSales.toFixed(2)}</p>
              <p className="text-sm text-success mt-1">↑ 5%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Icon name="payments" className="text-success" size={24} />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">PENDING ORDERS</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pendingOrders}</p>
              <p className="text-sm text-warning mt-1">↑ 2%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Icon name="pending_actions" className="text-warning" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Active Orders */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Active Orders</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Icon name="tune" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Icon name="refresh" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : liveOrders.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Icon name="inbox" size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No active orders</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="relative">
                  <div className="absolute top-3 right-3">
                    <Badge variant={order.status.toLowerCase()} size="sm">
                      {order.status}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Order #{order.orderNumber || order.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed {getElapsedTime(order.createdAt)} ago
                    </p>
                  </div>

                  <div className="mb-4">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <img
                          src={item.imageUrl || foodPlaceholder}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => { e.target.src = foodPlaceholder; }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.quantity}x {item.name}
                          </p>
                          {item.addons && <p className="text-xs text-gray-500">{item.addons}</p>}
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${getStatusColor(order.status)}`}>
                    <Icon name="schedule" size={16} />
                    <span className="text-sm font-semibold">Elapsed: {getElapsedTime(order.createdAt)}</span>
                  </div>

                  <div className="space-y-2">
                    {order.status === 'NEW' && (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => handleStatusChange(order.id, 'PREPARING')}
                      >
                        Confirm
                      </Button>
                    )}
                    {order.status === 'PREPARING' && (
                      <Button
                        variant="success"
                        size="md"
                        fullWidth
                        onClick={() => handleStatusChange(order.id, 'READY')}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'READY' && (
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                      >
                        Mark Picked Up
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
