import React from 'react';
import Icon from '../../../components/ui/Icon';

const OrgAdminDashboardNew = () => {
  return (
    <div className="min-h-screen bg-background-light p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Organization Dashboard</h1>
        <p className="text-slate-500">TechCorp Inc.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Employees', value: '1,234', icon: 'people', color: 'bg-blue-100 text-blue-600' },
          { label: 'Active Vendors', value: '12', icon: 'store', color: 'bg-green-100 text-green-600' },
          { label: 'Monthly Spend', value: '$45K', icon: 'payments', color: 'bg-purple-100 text-purple-600' },
          { label: 'Locations', value: '5', icon: 'location_on', color: 'bg-orange-100 text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
            <div className={`size-12 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
              <Icon name={stat.icon} size={24} />
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Icon name="pending_actions" className="text-primary" /> Pending Approvals
          </h3>
          <div className="space-y-3">
            {['Vendor Registration - Coffee Corner', 'Wallet Topup Request - $500'].map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <p className="text-sm">{item}</p>
                <button className="text-primary font-semibold text-sm">Review</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Icon name="location_on" className="text-primary" /> Locations
          </h3>
          <div className="space-y-2">
            {['Main Campus', 'Tech Park Branch', 'Downtown Office'].map((loc, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg flex justify-between">
                <span>{loc}</span>
                <Icon name="arrow_forward" className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgAdminDashboardNew;
