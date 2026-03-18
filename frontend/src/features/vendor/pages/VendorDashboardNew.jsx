import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../../../components/ui/Icon';
import Badge from '../../../components/ui/Badge';

const VendorDashboardNew = () => {
  const { data: metrics } = useQuery({ queryKey: ['vendor-metrics'], queryFn: () => mockMetrics });
  const { data: liveOrders = [] } = useQuery({ queryKey: ['live-orders'], queryFn: () => mockLiveOrders });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Vendor Dashboard</h1>
        <p className="text-slate-500">Welcome back, Cafeteria Main</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Today Orders', value: metrics?.todayOrders || 0, icon: 'receipt_long', color: 'bg-blue-100 text-blue-600' },
          { label: 'Revenue', value: `$${metrics?.revenue || 0}`, icon: 'payments', color: 'bg-green-100 text-green-600' },
          { label: 'Pending', value: metrics?.pending || 0, icon: 'schedule', color: 'bg-orange-100 text-orange-600' },
          { label: 'Completed', value: metrics?.completed || 0, icon: 'check_circle', color: 'bg-purple-100 text-purple-600' },
        ].map((metric, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
            <div className={`size-10 rounded-full flex items-center justify-center mb-2 ${metric.color}`}>
              <Icon name={metric.icon} size={24} />
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Live Orders</h2>
          <Badge variant="primary">{liveOrders.length} New</Badge>
        </div>
        <div className="space-y-3">
          {liveOrders.map(order => (
            <div key={order.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">Order #{order.orderNumber}</p>
                <Badge variant={order.status === 'PENDING' ? 'warning' : 'primary'} size="sm">{order.status}</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2">{order.items} items - ${order.total}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold">Accept</button>
                <button className="px-4 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-semibold">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const mockMetrics = { todayOrders: 45, revenue: 1250, pending: 8, completed: 37 };
const mockLiveOrders = [
  { id: 1, orderNumber: 'BD-1092', items: 3, total: '28.50', status: 'PENDING' },
  { id: 2, orderNumber: 'BD-1093', items: 2, total: '15.00', status: 'CONFIRMED' },
];

export default VendorDashboardNew;
