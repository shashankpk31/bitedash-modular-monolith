import React from 'react';
import Icon from '../../../components/ui/Icon';

const SuperAdminDashboardNew = () => {
  return (
    <div className="min-h-screen bg-background-light p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Super Admin Dashboard</h1>
        <p className="text-slate-500">Platform Overview</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Organizations', value: '45', icon: 'business', color: 'bg-blue-500' },
          { label: 'Total Users', value: '12.5K', icon: 'people', color: 'bg-green-500' },
          { label: 'Total Orders', value: '89K', icon: 'receipt_long', color: 'bg-purple-500' },
          { label: 'Revenue', value: '$2.5M', icon: 'payments', color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
            <div className={`${stat.color} size-14 rounded-full flex items-center justify-center text-white mb-4`}>
              <Icon name={stat.icon} size={28} />
            </div>
            <p className="text-3xl font-bold mb-2">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">Recent Organizations</h3>
          <div className="space-y-3">
            {['TechCorp Inc.', 'StartupHub', 'MegaCorp Ltd.'].map((org, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold">{org}</p>
                  <p className="text-xs text-slate-500">Active • 234 employees</p>
                </div>
                <button className="text-primary font-semibold">Manage</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">System Health</h3>
          <div className="space-y-4">
            {[
              { service: 'API Gateway', status: 'Operational', color: 'bg-green-500' },
              { service: 'Database', status: 'Operational', color: 'bg-green-500' },
              { service: 'Payment Service', status: 'Operational', color: 'bg-green-500' },
            ].map((service, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-medium">{service.service}</span>
                <div className="flex items-center gap-2">
                  <span className={`${service.color} w-2 h-2 rounded-full`} />
                  <span className="text-sm text-slate-600">{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardNew;
