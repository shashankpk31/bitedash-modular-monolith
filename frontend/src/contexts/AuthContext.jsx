import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axiosInstance';
import { LOCL_STRG_KEY, getRoleBasedPath } from '../config/constants';
import { getStoredUser, getStoredToken } from '../common/utils';

// Why use Context? Provides authentication state globally without prop drilling
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize auth state from localStorage on mount
  // Why? Restore user session after page refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        const storedToken = getStoredToken();

        if (storedUser && storedToken) {
          // Validate token with backend to ensure it's still valid
          // Why? Prevents using expired or revoked tokens
          try {
            await api.get('/auth/validate');
            setUser(storedUser);
          } catch (error) {
            // Token invalid - clear storage
            console.warn('Token validation failed:', error);
            localStorage.clear();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.clear();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Save login details after successful authentication
  // Why useCallback? Prevents function recreation on every render
  const saveLoginDetails = useCallback((userData, token, refreshToken = null) => {
    localStorage.setItem(LOCL_STRG_KEY.USER, JSON.stringify(userData));
    localStorage.setItem(LOCL_STRG_KEY.TOKEN, token);
    if (refreshToken) {
      localStorage.setItem(LOCL_STRG_KEY.REFRESH_TOKEN, refreshToken);
    }
    setUser(userData);
  }, []);

  // Logout user and clear all stored data
  // Why useCallback? Function reference stability for dependency arrays
  const logout = useCallback(() => {
    // Clear all local storage
    localStorage.removeItem(LOCL_STRG_KEY.USER);
    localStorage.removeItem(LOCL_STRG_KEY.TOKEN);
    localStorage.removeItem(LOCL_STRG_KEY.REFRESH_TOKEN);
    localStorage.removeItem(LOCL_STRG_KEY.CART);
    localStorage.removeItem(LOCL_STRG_KEY.LOCATION);

    setUser(null);

    // Redirect to home
    window.location.href = '/';
  }, []);

  // Update user data in state and storage
  // Why? Allows updating user profile without re-login
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(LOCL_STRG_KEY.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get redirect path based on user role
  // Why? Ensures users land on their appropriate dashboard
  const getRedirectPath = useCallback(() => {
    if (!user) return '/';
    return getRoleBasedPath(user.role);
  }, [user]);

  // Check if user has specific role
  // Why? Role-based access control throughout the app
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  // Memoize context value to prevent unnecessary re-renders
  // Why useMemo? Only recreate value when dependencies change
  const value = useMemo(
    () => ({
      // State
      user,
      isInitializing,
      isLoading,
      isAuthenticated: !!user,

      // Actions
      saveLoginDetails,
      logout,
      updateUser,
      setIsLoading,

      // Helpers
      getRedirectPath,
      hasRole,
      hasAnyRole,
    }),
    [
      user,
      isInitializing,
      isLoading,
      saveLoginDetails,
      logout,
      updateUser,
      getRedirectPath,
      hasRole,
      hasAnyRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
// Why? Provides better error messages and type safety
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default AuthContext;
