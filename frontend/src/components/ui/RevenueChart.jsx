import React from 'react';
import { TrendingUp, DollarSign, CreditCard, Megaphone } from 'lucide-react';

function RevenueChart({ revenueStats, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!revenueStats || !revenueStats.revenueByType) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Revenue Breakdown</h3>
        <p className="text-gray-400 text-center py-12">No revenue data available</p>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    commissionRevenue = 0,
    gatewayMarkupRevenue = 0,
    promotionRevenue = 0,
  } = revenueStats;

  const getPercentage = (value) => {
    if (totalRevenue === 0) return 0;
    return ((value / totalRevenue) * 100).toFixed(1);
  };

  const revenueBreakdown = [
    {
      label: 'Order Commission',
      amount: commissionRevenue,
      percentage: getPercentage(commissionRevenue),
      color: '#f97316', 
      icon: <DollarSign size={20} />,
    },
    {
      label: 'Gateway Markup',
      amount: gatewayMarkupRevenue,
      percentage: getPercentage(gatewayMarkupRevenue),
      color: '#3b82f6', 
      icon: <CreditCard size={20} />,
    },
    {
      label: 'Promotion Revenue',
      amount: promotionRevenue,
      percentage: getPercentage(promotionRevenue),
      color: '#8b5cf6', 
      icon: <Megaphone size={20} />,
    },
  ];

  const donutRadius = 80;
  const donutThickness = 25;
  const center = 100;
  const circumference = 2 * Math.PI * donutRadius;

  let currentOffset = 0;
  const segments = revenueBreakdown.map((item) => {
    const percentage = parseFloat(item.percentage);
    const segmentLength = (percentage / 100) * circumference;
    const segment = {
      ...item,
      strokeDasharray: `${segmentLength} ${circumference}`,
      strokeDashoffset: -currentOffset,
    };
    currentOffset += segmentLength;
    return segment;
  });

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      {}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-brand-primary" size={24} />
            Platform Revenue Breakdown
          </h3>
          <p className="text-sm text-gray-500 mt-1">Total earnings across all sources</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-black text-brand-primary">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {}
              <circle
                cx={center}
                cy={center}
                r={donutRadius}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth={donutThickness}
              />

              {}
              {segments.map((segment, index) => (
                <circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={donutRadius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={donutThickness}
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  className="transition-all duration-300"
                />
              ))}

              {}
              <text
                x={center}
                y={center - 10}
                textAnchor="middle"
                className="text-xs fill-gray-500 font-medium"
              >
                Revenue
              </text>
              <text
                x={center}
                y={center + 10}
                textAnchor="middle"
                className="text-lg fill-gray-800 font-bold"
              >
                100%
              </text>
            </svg>
          </div>
        </div>

        {}
        <div className="space-y-4">
          {revenueBreakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {}
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {}
                <div className="flex items-center gap-2">
                  <div style={{ color: item.color }}>{item.icon}</div>
                  <span className="font-semibold text-gray-800">{item.label}</span>
                </div>
              </div>

              {}
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 font-medium">{item.percentage}%</p>
              </div>
            </div>
          ))}

          {}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
            <div className="flex items-center gap-2 text-orange-900 mb-2">
              <TrendingUp size={18} />
              <span className="font-bold text-sm">Revenue Insights</span>
            </div>
            <p className="text-xs text-orange-800 leading-relaxed">
              {commissionRevenue > gatewayMarkupRevenue
                ? 'Order commissions are the primary revenue driver.'
                : 'Gateway markups contribute significantly to platform earnings.'}
              {promotionRevenue > 0 && ' Promotions are generating additional revenue.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;
