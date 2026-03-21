import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { API_BASE_URL, WS_ENDPOINTS, TOAST_DURATION, ORDER_STATUS } from '../config/constants';

// Why use Context? WebSocket connection should be shared app-wide
const OrderNotificationContext = createContext(null);

export const OrderNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use ref to access current state in WebSocket callbacks
  // Why? WebSocket callbacks close over initial state, ref stays current
  const clientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectWebSocket();
      return;
    }

    connectWebSocket();

    // Cleanup on unmount or auth change
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user]);

  // Connect to WebSocket with SockJS fallback
  // Why SockJS? Provides fallback for browsers/networks that don't support WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      // Create STOMP client with SockJS transport
      const client = new Client({
        // Use SockJS for better compatibility
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),

        // Connection timeouts
        connectionTimeout: 10000,
        reconnectDelay: 5000,

        // Debug logging in development
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.log('STOMP:', str);
          }
        },

        // On successful connection
        onConnect: () => {
          console.log('WebSocket connected');
          setIsConnected(true);

          // Subscribe to user-specific notification channel
          // Why? Each user gets their own queue for targeted notifications
          client.subscribe(`/user/queue/notifications`, (message) => {
            try {
              const notification = JSON.parse(message.body);
              handleNotification(notification);
            } catch (error) {
              console.error('Failed to parse notification:', error);
            }
          });

          // Subscribe to order updates if vendor/employee
          if (user?.role === 'ROLE_VENDOR' || user?.role === 'ROLE_EMPLOYEE') {
            client.subscribe(`/topic/orders`, (message) => {
              try {
                const order = JSON.parse(message.body);
                handleOrderUpdate(order);
              } catch (error) {
                console.error('Failed to parse order update:', error);
              }
            });
          }
        },

        // On disconnection
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        },

        // On error
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setIsConnected(false);

          // Attempt reconnection after 5 seconds
          // Why? Transient network issues are common
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isAuthenticated) {
              console.log('Attempting to reconnect WebSocket...');
              connectWebSocket();
            }
          }, 5000);
        },
      });

      // Activate the client
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [isAuthenticated, user]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }

    clientRef.current = null;
    setIsConnected(false);
  }, []);

  // Handle incoming notification
  const handleNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast based on notification type
    const toastMessage = notification.message || 'New notification';

    switch (notification.type) {
      case 'ORDER_CONFIRMED':
        toast.success(toastMessage, { duration: TOAST_DURATION.SUCCESS, icon: '✅' });
        break;
      case 'ORDER_READY':
        toast.success(toastMessage, { duration: TOAST_DURATION.SUCCESS, icon: '🔔' });
        break;
      case 'ORDER_CANCELLED':
        toast.error(toastMessage, { duration: TOAST_DURATION.ERROR, icon: '❌' });
        break;
      case 'WALLET_CREDITED':
        toast.success(toastMessage, { duration: TOAST_DURATION.SUCCESS, icon: '💰' });
        break;
      default:
        toast.info(toastMessage, { duration: TOAST_DURATION.INFO });
    }
  }, []);

  // Handle order status updates
  const handleOrderUpdate = useCallback((order) => {
    // Only show notifications for relevant order statuses
    const notifiableStatuses = [
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.READY,
      ORDER_STATUS.CANCELLED,
    ];

    if (notifiableStatuses.includes(order.status)) {
      const statusMessages = {
        [ORDER_STATUS.CONFIRMED]: 'Your order has been confirmed',
        [ORDER_STATUS.READY]: 'Your order is ready for pickup',
        [ORDER_STATUS.CANCELLED]: 'Your order has been cancelled',
      };

      toast.info(statusMessages[order.status], {
        duration: TOAST_DURATION.INFO,
        icon: '📦',
      });
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Memoize context value
  const value = useMemo(
    () => ({
      // State
      notifications,
      unreadCount,
      isConnected,

      // Actions
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
      isConnected,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    ]
  );

  return (
    <OrderNotificationContext.Provider value={value}>
      {children}
    </OrderNotificationContext.Provider>
  );
};

OrderNotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use order notification context
export const useOrderNotification = () => {
  const context = useContext(OrderNotificationContext);

  if (!context) {
    throw new Error('useOrderNotification must be used within OrderNotificationProvider');
  }

  return context;
};

export default OrderNotificationContext;
