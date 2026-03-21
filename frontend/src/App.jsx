import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import {
  AuthProvider,
  CartProvider,
  LocationProvider,
  OrderNotificationProvider,
} from './contexts';
import AppRoutes from './routes/AppRoutes';
import queryClient from './config/queryClient';
import { TOAST_DURATION } from './config/constants';
import { ErrorBoundary, InstallPrompt, OfflineIndicator } from './common/components';

// Main App component with all providers properly nested
// Why this order? QueryClient → Auth → Cart/Location → OrderNotifications
// Reason: Each provider may depend on the ones above it
function App() {
  // Initialize app on mount
  useEffect(() => {
    // Remove the initial loading screen
    // Why timeout? Allows React to render before removing loader
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100);

    // Log app initialization in development
    if (import.meta.env.DEV) {
      console.log('🚀 BiteDash initialized');
      console.log('📡 API URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089');
    }
  }, []);

  return (
    // Error Boundary - catch and handle React errors gracefully
    // Why outermost? Catches all errors in the component tree
    <ErrorBoundary>
      {/* TanStack Query Provider - wraps everything for server state management */}
      {/* Why first? All API calls throughout the app need this */}
      <QueryClientProvider client={queryClient}>
        {/* Auth Provider - manages user authentication state */}
        {/* Why second? Many components need to know if user is logged in */}
        <AuthProvider>
        {/* Cart Provider - manages shopping cart state */}
        {/* Why here? Requires Auth to work properly */}
        <CartProvider>
          {/* Location Provider - manages selected location/cafeteria */}
          <LocationProvider>
            {/* Order Notification Provider - WebSocket for real-time updates */}
            {/* Why last? Needs Auth context to establish connection */}
            <OrderNotificationProvider>

              {/* Main application routes */}
              <AppRoutes />

              {/* Toast notifications - global notification system */}
              {/* Why here? Available to all components */}
              <Toaster
                position="top-right"
                toastOptions={{
                  // Default duration
                  duration: TOAST_DURATION.SUCCESS,

                  // Custom styling to match design system
                  style: {
                    background: '#2e2f2e',
                    color: '#f8f6f5',
                    borderRadius: '1rem',
                    padding: '16px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '0.875rem',
                  },

                  // Success toast styling
                  success: {
                    duration: TOAST_DURATION.SUCCESS,
                    iconTheme: {
                      primary: '#a73300',
                      secondary: '#ffefeb',
                    },
                  },

                  // Error toast styling
                  error: {
                    duration: TOAST_DURATION.ERROR,
                    iconTheme: {
                      primary: '#b31b25',
                      secondary: '#ffefee',
                    },
                  },

                  // Loading toast
                  loading: {
                    duration: Infinity, // Stays until dismissed
                  },
                }}
                // Limit concurrent toasts to avoid cluttering
                containerStyle={{
                  top: 20,
                  right: 20,
                }}
              />

              {/* React Query DevTools - only in development */}
              {/* Why? Helpful for debugging queries and cache */}
              {import.meta.env.DEV && (
                <ReactQueryDevtools
                  initialIsOpen={false}
                  position="bottom-right"
                />
              )}

              {/* Offline Indicator - show when internet connection is lost */}
              <OfflineIndicator />

              {/* Install Prompt - PWA installation prompt */}
              <InstallPrompt />

            </OrderNotificationProvider>
          </LocationProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
