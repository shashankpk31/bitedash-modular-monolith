import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import SearchBar from '../../../components/ui/SearchBar';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import { motion } from 'framer-motion';
import orderService from '../../../services/orderService';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'my-orders'],
    queryFn: orderService.getMyOrders,
    staleTime: 30 * 1000,
  });

  const tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'drafts', label: 'Drafts' },
  ];

  const getStatusVariant = (status) => {
    const variants = {
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
      PREPARING: 'preparing',
      READY: 'ready',
      NEW: 'new',
    };
    return variants[status] || 'default';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'ongoing' ? ['NEW', 'PREPARING', 'READY'].includes(order.status) :
      activeTab === 'drafts' ? order.status === 'DRAFT' : true;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Icon name="arrow_back" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order History</h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Icon name="filter_list" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search by Order ID or Vendor"
        />
      </div>

      {/* Recent Activity Header */}
      <div className="px-4 flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="inbox" size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/employee/orders/${order.id}`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="restaurant" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                      {order.vendorName || 'Vendor'}
                    </h3>
                    <Badge variant={getStatusVariant(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ORDER ID <span className="text-gray-900 dark:text-gray-100 font-semibold">#{order.orderNumber || order.id}</span>
                </span>
                <span className="text-lg font-bold text-primary">
                  ${(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
