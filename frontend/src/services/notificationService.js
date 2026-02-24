/**
 * Browser Notification Service
 * Handles push notifications for the BiteDash application
 */

export const notificationService = {
  /**
   * Check if notifications are supported in this browser
   */
  isSupported: () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  /**
   * Get current notification permission status
   * @returns {string} 'granted', 'denied', 'default', or 'unsupported'
   */
  getPermission: () => {
    if (!notificationService.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  /**
   * Request notification permission from the user
   * @returns {Promise<string>} The permission result
   */
  requestPermission: async () => {
    if (!notificationService.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  },

  /**
   * Show a local browser notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @returns {Notification|null} The notification instance or null
   */
  showNotification: (title, options = {}) => {
    if (!notificationService.isSupported()) {
      console.warn('Notifications not supported');
      return null;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/logo.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    };

    try {
      return new Notification(title, defaultOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  },

  /**
   * Show notification via Service Worker (for background notifications)
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  showServiceWorkerNotification: async (title, options = {}) => {
    if (!notificationService.isSupported()) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const defaultOptions = {
        body: 'You have a new notification',
        icon: '/logo.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        data: {},
        actions: [
          { action: 'view', title: 'View' },
          { action: 'close', title: 'Close' },
        ],
        ...options,
      };

      await registration.showNotification(title, defaultOptions);
    } catch (error) {
      console.error('Error showing service worker notification:', error);
    }
  },

  /**
   * Check if document is currently visible
   * @returns {boolean}
   */
  isDocumentVisible: () => {
    return document.visibilityState === 'visible';
  },

  /**
   * Smart notification - shows toast if visible, browser notification if not
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @param {Function} toastFn - Optional toast function to call when document is visible
   */
  smartNotify: (title, options = {}, toastFn = null) => {
    if (notificationService.isDocumentVisible()) {
      // User is actively viewing the app - use toast notification
      if (toastFn && typeof toastFn === 'function') {
        toastFn(options.body || title);
      }
    } else {
      // App is in background - use browser notification
      notificationService.showNotification(title, options);
    }
  },

  /**
   * Show order update notification
   * @param {Object} orderData - Order information
   */
  notifyOrderUpdate: (orderData) => {
    const { orderNumber, status, message } = orderData;

    notificationService.showNotification('Order Update', {
      body: message || `Order ${orderNumber} is now ${status}`,
      tag: `order-${orderNumber}`,
      data: { orderNumber, status, url: '/orders' },
      requireInteraction: status === 'READY',
    });
  },

  /**
   * Test notification functionality
   */
  test: async () => {
    console.log('Testing notification service...');
    console.log('Supported:', notificationService.isSupported());
    console.log('Permission:', notificationService.getPermission());

    if (Notification.permission !== 'granted') {
      const permission = await notificationService.requestPermission();
      console.log('Permission after request:', permission);
    }

    if (Notification.permission === 'granted') {
      notificationService.showNotification('Test Notification', {
        body: 'This is a test notification from BiteDash!',
        requireInteraction: false,
      });
    }
  },
};

export default notificationService;
