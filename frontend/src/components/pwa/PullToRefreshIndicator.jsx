import React from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefreshIndicator = ({ isRefreshing, pullDistance, threshold }) => {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullDistance / threshold) * 360;

  return (
    <div
      className="fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-200"
      style={{
        opacity: pullDistance > 0 ? 1 : 0,
        transform: `translate(-50%, ${Math.min(pullDistance, threshold)}px)`,
      }}
    >
      <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
        <RefreshCw
          size={24}
          className={`text-brand-primary ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined,
          }}
        />
      </div>
      {pullDistance >= threshold && !isRefreshing && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-sm font-medium text-gray-700">
            Release to refresh
          </span>
        </div>
      )}
    </div>
  );
};

export default PullToRefreshIndicator;
