import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Icon from '../../../../components/ui/Icon';
import Badge from '../../../../components/ui/Badge';
import orderService from '../../../../services/orderService';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', activeTab],
    queryFn: () => orderService.getMyOrders(),
    placeholderData: mockOrders,
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', text: 'Pending' },
      CONFIRMED: { variant: 'info', text: 'Confirmed' },
      PREPARING: { variant: 'primary', text: 'Preparing' },
      READY: { variant: 'success', text: 'Ready' },
      COMPLETED: { variant: 'default', text: 'Completed' },
      CANCELLED: { variant: 'danger', text: 'Cancelled' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-background-dark min-h-screen flex flex-col shadow-xl">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-primary/10">
            <Icon name="arrow_back" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">Order History</h1>
          <button className="size-10 flex items-center justify-center">
            <Icon name="filter_list" className="text-primary" />
          </button>
        </div>

        <div className="flex border-b border-primary/5 px-4">
          {['all', 'ongoing', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 pt-2 border-b-2 ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500'
              }`}
            >
              <p className="text-sm font-bold capitalize">{tab}</p>
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="flex items-stretch rounded-xl h-12 bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-center pl-4"><Icon name="search" className="text-primary/60" /></div>
          <input
            className="w-full bg-transparent border-none focus:ring-0 px-3 text-sm"
            placeholder="Search by Order ID or Vendor"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <main className="flex-1 px-4 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Recent Activity</h3>
          <span className="text-xs text-primary font-medium">Last 30 days</span>
        </div>

        {orders.map(order => {
          const status = getStatusBadge(order.status);
          return (
            <div
              key={order.id}
              onClick={() => navigate(`/employee/orders/${order.id}`)}
              className="bg-white dark:bg-slate-800/40 rounded-xl p-4 border border-primary/5 shadow-sm mb-4 cursor-pointer active:scale-[0.98] transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-sm">Order #{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">{order.vendorName}</p>
                </div>
                <Badge variant={status.variant} size="sm">{status.text}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Icon name="schedule" size={14} />
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">{order.itemCount} items</span>
                <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

const mockOrders = [
  { id: 1, orderNumber: 'BD-1092', vendorName: 'Cafeteria Main', status: 'READY', itemCount: 3, total: 28.50, createdAt: new Date() },
  { id: 2, orderNumber: 'BD-1091', vendorName: 'Coffee Corner', status: 'COMPLETED', itemCount: 1, total: 5.00, createdAt: new Date(Date.now() - 86400000) },
];

export default OrderHistory;
