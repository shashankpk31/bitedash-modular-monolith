import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Offline Indicator - Show banner when internet connection is lost
// Why? Users need to know when they're offline to understand why features may not work
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide reconnected message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!isOnline || showReconnected) && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div
            className={`py-3 px-4 text-center font-label text-label-md ${
              isOnline
                ? 'bg-green-600 text-white'
                : 'bg-error text-on-error'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <Wifi size={16} />
                  <span>You're back online!</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} />
                  <span>You're offline. Some features may not work.</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
