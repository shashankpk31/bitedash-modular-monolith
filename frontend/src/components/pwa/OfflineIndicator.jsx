import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
      toast.success('Back online!', {
        icon: '🟢',
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      toast.error('You are offline', {
        icon: '🔴',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show banner if already offline
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      toast.error('Still offline. Please check your connection.');
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-red-500 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <WifiOff size={20} className="flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">You're offline</p>
              <p className="text-xs opacity-90">
                Some features may not be available
              </p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
