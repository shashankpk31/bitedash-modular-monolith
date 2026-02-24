import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { LOCL_STRG_KEY } from '../config/constants';

/**
 * Custom React hook for WebSocket connections using STOMP over SockJS.
 * Provides real-time bidirectional communication with the backend.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoConnect - Whether to connect automatically (default: true)
 * @param {Function} options.onConnect - Callback when connection is established
 * @param {Function} options.onDisconnect - Callback when connection is lost
 * @param {Function} options.onError - Callback when an error occurs
 * @returns {Object} WebSocket utilities
 */
const useWebSocket = (options = {}) => {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 300000; // 5 minutes (300,000 ms)

  /**
   * Initializes WebSocket connection
   */
  const connect = useCallback(() => {
    if (clientRef.current?.active) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Initiating connection...');

    const token = localStorage.getItem(LOCL_STRG_KEY.TOKEN);
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8089/ws';

    // Create STOMP client with SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      debug: (str) => {
        // Only log important messages in production
        if (import.meta.env.DEV) {
          console.log('[STOMP Debug]', str);
        }
      },
      reconnectDelay: RECONNECT_DELAY,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        console.log('[WebSocket] Connected successfully', frame);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;

        if (onConnect) {
          onConnect(frame);
        }
      },
      onDisconnect: (frame) => {
        console.log('[WebSocket] Disconnected', frame);
        setIsConnected(false);
        subscriptionsRef.current.clear();

        if (onDisconnect) {
          onDisconnect(frame);
        }

        // Attempt reconnection
        attemptReconnect();
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error', frame);
        const errorMsg = frame.headers?.message || 'WebSocket error occurred';
        setConnectionError(errorMsg);

        if (onError) {
          onError(errorMsg);
        }
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error', event);
        const errorMsg = 'WebSocket connection error';
        setConnectionError(errorMsg);

        if (onError) {
          onError(errorMsg);
        }
      },
    });

    clientRef.current = client;
    client.activate();
  }, [onConnect, onDisconnect, onError]);

  /**
   * Attempts to reconnect with fixed 5-minute delay
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[WebSocket] Max reconnection attempts reached (3 attempts)');
      setConnectionError('Failed to reconnect after 3 attempts. Please refresh the page.');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delayMinutes = RECONNECT_DELAY / 60000;

    console.log(`[WebSocket] Reconnecting in ${delayMinutes} minutes (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, RECONNECT_DELAY);
  }, [connect]);

  /**
   * Disconnects WebSocket connection
   */
  const disconnect = useCallback(() => {
    console.log('[WebSocket] Disconnecting...');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }

    subscriptionsRef.current.clear();
    setIsConnected(false);
  }, []);

  /**
   * Subscribes to a destination (topic or queue)
   * @param {string} destination - Destination path (e.g., /topic/orders/vendor/123)
   * @param {Function} callback - Message handler
   * @returns {string} Subscription ID
   */
  const subscribe = useCallback((destination, callback) => {
    if (!clientRef.current?.active) {
      console.warn('[WebSocket] Not connected. Cannot subscribe to:', destination);
      return null;
    }

    console.log('[WebSocket] Subscribing to:', destination);

    try {
      const subscription = clientRef.current.subscribe(destination, (message) => {
        try {
          const body = JSON.parse(message.body);
          console.log('[WebSocket] Message received from', destination, body);
          callback(body);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      const subscriptionId = subscription.id;
      subscriptionsRef.current.set(subscriptionId, subscription);

      return subscriptionId;
    } catch (error) {
      console.error('[WebSocket] Subscription error:', error);
      return null;
    }
  }, []);

  /**
   * Unsubscribes from a destination
   * @param {string} subscriptionId - ID returned from subscribe()
   */
  const unsubscribe = useCallback((subscriptionId) => {
    if (!subscriptionId) return;

    const subscription = subscriptionsRef.current.get(subscriptionId);
    if (subscription) {
      console.log('[WebSocket] Unsubscribing:', subscriptionId);
      subscription.unsubscribe();
      subscriptionsRef.current.delete(subscriptionId);
    }
  }, []);

  /**
   * Sends a message to a destination
   * @param {string} destination - Destination path
   * @param {Object} body - Message payload
   */
  const send = useCallback((destination, body) => {
    if (!clientRef.current?.active) {
      console.warn('[WebSocket] Not connected. Cannot send message to:', destination);
      return;
    }

    try {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
      console.log('[WebSocket] Message sent to', destination, body);
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
  };
};

export default useWebSocket;
