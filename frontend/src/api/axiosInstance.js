import axios from 'axios';
import toast from 'react-hot-toast';
import { LOCL_STRG_KEY, API_BASE_URL, TOAST_DURATION } from '../config/constants';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds - prevents hanging requests
});

// Flag to prevent multiple refresh attempts simultaneously
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// REQUEST INTERCEPTOR - Attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCL_STRG_KEY.TOKEN);

    // Attach token if available (except for public endpoints)
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Backend sends data in success field, extract it for convenience
    if (response.data?.success) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (no response from server)
    if (!error.response) {
      toast.error('Network error. Please check your connection.', {
        duration: TOAST_DURATION.ERROR,
      });
      return Promise.reject(new Error('Network error'));
    }

    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || 'Something went wrong';

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      // If already trying to refresh, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(LOCL_STRG_KEY.REFRESH_TOKEN);

      // Try to refresh the token
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data;

          // Update stored tokens
          localStorage.setItem(LOCL_STRG_KEY.TOKEN, newToken);
          if (newRefreshToken) {
            localStorage.setItem(LOCL_STRG_KEY.REFRESH_TOKEN, newRefreshToken);
          }

          // Update default header
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);

          isRefreshing = false;

          // Retry original request with new token
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          processQueue(refreshError, null);
          isRefreshing = false;

          toast.error('Session expired. Please login again.', {
            duration: TOAST_DURATION.ERROR,
          });

          // Clear authentication data
          localStorage.removeItem(LOCL_STRG_KEY.TOKEN);
          localStorage.removeItem(LOCL_STRG_KEY.REFRESH_TOKEN);
          localStorage.removeItem(LOCL_STRG_KEY.USER);

          // Redirect to login (only if not already there)
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        // Only show error if user was authenticated before (had a token)
        const hadToken = localStorage.getItem(LOCL_STRG_KEY.TOKEN);

        if (hadToken) {
          toast.error('Session expired. Please login again.', {
            duration: TOAST_DURATION.ERROR,
          });
        }

        localStorage.clear();
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }

        isRefreshing = false;
        return Promise.reject(new Error('No refresh token'));
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (status === 403) {
      toast.error('Access denied. You don\'t have permission.', {
        duration: TOAST_DURATION.ERROR,
      });
      return Promise.reject(new Error('Forbidden'));
    }

    // Handle 404 Not Found
    if (status === 404) {
      toast.error('Resource not found.', {
        duration: TOAST_DURATION.ERROR,
      });
      return Promise.reject(new Error('Not found'));
    }

    // Handle 400 Bad Request - Validation errors
    if (status === 400) {
      toast.error(errorMessage, {
        duration: TOAST_DURATION.ERROR,
      });
      return Promise.reject(new Error(errorMessage));
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
      toast.error('Server error. Please try again later.', {
        duration: TOAST_DURATION.ERROR,
      });
      return Promise.reject(new Error('Server error'));
    }

    // Generic error handling
    toast.error(errorMessage, {
      duration: TOAST_DURATION.ERROR,
    });

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
