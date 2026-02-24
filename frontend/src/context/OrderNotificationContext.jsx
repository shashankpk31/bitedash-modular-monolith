import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

const OrderNotificationContext = createContext(null);

/**
 * Context provider for real-time order notifications.
 * Manages WebSocket connection and notification state.
 */
export const OrderNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    isConnected,
    connectionError,
    subscribe,
    unsubscribe,
  } = useWebSocket({
    autoConnect: !!user,
    onConnect: () => {
      console.log('[Notifications] WebSocket connected');
    },
    onDisconnect: () => {
      console.log('[Notifications] WebSocket disconnected');
    },
    onError: (error) => {
      console.error('[Notifications] WebSocket error:', error);
    },
  });

  /**
   * Handles incoming order notifications
   */
  const handleNotification = useCallback((notification) => {
    console.log('[Notifications] Received:', notification);

    // Add to notifications list
    setNotifications(prev => [{
      ...notification,
      id: `${notification.orderId}-${Date.now()}`,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
    }, ...prev.slice(0, 49)]); // Keep last 50 notifications

    // Increment unread count
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    const message = notification.message || 'Order update received';

    if (notification.type === 'NEW_ORDER') {
      toast.success(`${message} - Order #${notification.orderNumber}`, {
        duration: 5000,
        icon: '🔔',
      });
    } else if (notification.type === 'STATUS_CHANGE') {
      toast(`${message} - Order #${notification.orderNumber}`, {
        duration: 4000,
        icon: '📦',
      });
    } else {
      toast(message, {
        duration: 3000,
      });
    }

    // Play notification sound (optional)
    playNotificationSound();
  }, []);

  /**
   * Plays a notification sound
   */
  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('[Notifications] Failed to play sound:', error);
    }
  }, []);

  /**
   * Subscribes to relevant topics based on user role
   */
  useEffect(() => {
    if (!isConnected || !user) return;

    const subscriptionIds = [];

    // Subscribe based on user role
    if (user.role === 'ROLE_VENDOR') {
      // Vendors subscribe to their vendor topic
      const vendorTopic = `/topic/orders/vendor/${user.id}`;
      const subId = subscribe(vendorTopic, handleNotification);
      if (subId) {
        subscriptionIds.push(subId);
        console.log('[Notifications] Subscribed to vendor topic:', vendorTopic);
      }
    } else if (user.role === 'ROLE_EMPLOYEE') {
      // Employees subscribe to their user queue
      const userQueue = `/queue/orders/user/${user.id}`;
      const subId = subscribe(userQueue, handleNotification);
      if (subId) {
        subscriptionIds.push(subId);
        console.log('[Notifications] Subscribed to user queue:', userQueue);
      }
    }

    // Cleanup subscriptions on unmount or when dependencies change
    return () => {
      subscriptionIds.forEach(subId => unsubscribe(subId));
    };
  }, [isConnected, user, subscribe, unsubscribe, handleNotification]);

  /**
   * Marks a notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  /**
   * Marks all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  /**
   * Clears a specific notification
   */
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(notif => notif.id !== notificationId);
    });
  }, []);

  /**
   * Clears all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    connectionError,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return (
    <OrderNotificationContext.Provider value={value}>
      {children}
    </OrderNotificationContext.Provider>
  );
};

/**
 * Hook to access order notification context
 */
export const useOrderNotifications = () => {
  const context = useContext(OrderNotificationContext);
  if (!context) {
    throw new Error('useOrderNotifications must be used within OrderNotificationProvider');
  }
  return context;
};

export default OrderNotificationContext;
