import React from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";

const VendorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Orders", value: "0", icon: ShoppingBag, color: "text-blue-600" },
    { label: "Menu Items", value: "0", icon: Package, color: "text-green-600" },
    { label: "Revenue", value: "₹0", icon: DollarSign, color: "text-purple-600" },
    { label: "Growth", value: "0%", icon: TrendingUp, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username || "Vendor"}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-brand-primary" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vendor Dashboard Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              We're working on building an amazing dashboard experience for vendors.
              Features like order management, menu management, and analytics will be available soon!
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/vendor/menu"
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Manage Menu
              </a>
              <a
                href="/vendor/orders"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Orders
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
