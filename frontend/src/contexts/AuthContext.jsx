import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axiosInstance';
import { LOCL_STRG_KEY, getRoleBasedPath } from '../config/constants';
import { getStoredUser } from '../common/utils';

// Why use Context? Provides authentication state globally without prop drilling
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize auth state on mount
  // Why? Restore user session after page refresh (tokens are in HTTP-only cookies)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();

        if (storedUser) {
          // Validate session with backend - cookies sent automatically
          // Why? Ensures HTTP-only cookie token is still valid
          try {
            await api.get('/auth/validate');
            setUser(storedUser);
          } catch (error) {
            // Session invalid - clear user data (cookies cleared by server on 401)
            console.warn('Session validation failed:', error);
            localStorage.removeItem(LOCL_STRG_KEY.USER);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem(LOCL_STRG_KEY.USER);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Save login details after successful authentication
  // Why useCallback? Prevents function recreation on every render
  // Note: JWT tokens are now stored in HTTP-only cookies by the server
  const saveLoginDetails = useCallback((userData) => {
    // Only store user data for UI (tokens are in secure HTTP-only cookies)
    localStorage.setItem(LOCL_STRG_KEY.USER, JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Logout user and clear all stored data
  // Why useCallback? Function reference stability for dependency arrays
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear HTTP-only cookies on server
      await api.post('/auth/logout');
    } catch (error) {
      // Logout even if server call fails
      console.warn('Logout API call failed:', error);
    }

    // Clear local storage (user data only - tokens are in cookies)
    localStorage.removeItem(LOCL_STRG_KEY.USER);
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
