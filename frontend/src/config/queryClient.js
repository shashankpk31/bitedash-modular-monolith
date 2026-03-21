// TanStack Query configuration for server state management

import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { TOAST_DURATION } from './constants';

// Create QueryClient with default options
// Why use TanStack Query? It handles caching, background refetching, and request deduplication automatically
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long cached data stays fresh before refetch (5 minutes)
      // Why? Balances data freshness with reduced API calls
      staleTime: 1000 * 60 * 5,

      // How long inactive data stays in cache (10 minutes)
      // Why? Keeps recently viewed data accessible without re-fetching
      cacheTime: 1000 * 60 * 10,

      // Retry failed requests 1 time before giving up
      // Why? Network hiccups are common, but we don't want to spam failed requests
      retry: 1,

      // Wait 1 second before retrying
      // Why? Gives the server/network time to recover
      retryDelay: 1000,

      // Refetch data when user returns to the tab
      // Why? Ensures data is current when user is actively using the app
      refetchOnWindowFocus: true,

      // Don't refetch when component remounts (use cached data)
      // Why? Prevents unnecessary API calls during navigation
      refetchOnMount: false,

      // Refetch when network reconnects
      // Why? Sync data after offline period
      refetchOnReconnect: true,

      // Global error handler for queries
      // Why? Centralized error handling avoids repetitive error code
      onError: (error) => {
        // Network errors are already handled by axios interceptor
        // This catches any other errors (parsing, etc.)
        if (!error.message?.includes('Network')) {
          console.error('Query error:', error);
        }
      },
    },

    mutations: {
      // Retry mutations once if they fail
      // Why? Some failures (like network blips) are transient
      retry: 1,

      // Global error handler for mutations
      // Why? Centralized handling of mutation failures
      onError: (error) => {
        console.error('Mutation error:', error);
        toast.error(error.message || 'Something went wrong', {
          duration: TOAST_DURATION.ERROR,
        });
      },
    },
  },
});

// Helper to invalidate queries after mutations
// Why? Ensures UI reflects latest data after changes
export const invalidateQueries = (queryKeys) => {
  if (Array.isArray(queryKeys[0])) {
    // Multiple query keys
    queryKeys.forEach(key => queryClient.invalidateQueries(key));
  } else {
    // Single query key
    queryClient.invalidateQueries(queryKeys);
  }
};

// Helper for optimistic updates
// Why? Provides instant feedback while waiting for server confirmation
export const optimisticUpdate = async (queryKey, updateFn, mutation) => {
  // Cancel any outgoing refetches so they don't overwrite optimistic update
  await queryClient.cancelQueries(queryKey);

  // Snapshot current value
  const previousValue = queryClient.getQueryData(queryKey);

  // Optimistically update cache
  queryClient.setQueryData(queryKey, updateFn);

  // Return rollback function in case mutation fails
  return {
    previousValue,
    rollback: () => queryClient.setQueryData(queryKey, previousValue),
  };
};

export default queryClient;
