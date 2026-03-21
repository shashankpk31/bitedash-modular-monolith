// Auth-related TanStack Query hooks
// Why separate from API? Provides React integration with caching, loading states, and error handling

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  registerUser,
  verifyAccount,
  resendOTP,
  loginUser,
  logoutUser,
  validateToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateUserProfile,
} from '../api/auth.api';
import { useAuth } from '../../contexts/AuthContext';
import { QUERY_KEYS, TOAST_DURATION } from '../../config/constants';

/**
 * Hook for user registration
 * Why mutation? Modifies server state (creates new user)
 */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data, variables) => {
      toast.success('Registration successful! Please verify your account.', {
        duration: TOAST_DURATION.SUCCESS,
      });
      // Navigate to verification with identifier
      navigate('/verify', { state: { identifier: variables.email || variables.phone } });
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed. Please try again.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook for account verification
 * Why mutation? Verifies user and generates auth token
 */
export const useVerifyAccount = () => {
  const { saveLoginDetails } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ identifier, otp }) => verifyAccount(identifier, otp),
    onSuccess: (data) => {
      // Save auth details to context
      saveLoginDetails(data.user, data.token, data.refreshToken);

      toast.success('Account verified successfully!', {
        duration: TOAST_DURATION.SUCCESS,
      });

      // Check if user needs approval
      if (data.user.status === 'PENDING_APPROVAL') {
        navigate('/pending-approval');
      } else {
        // Navigate to role-based dashboard
        const redirectPath = getRoleBasedPath(data.user.role);
        navigate(redirectPath);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Verification failed. Please check your OTP.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook for resending OTP
 */
export const useResendOTP = () => {
  return useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      toast.success('OTP sent successfully! Please check your email/phone.', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send OTP. Please try again.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook for user login
 */
export const useLogin = () => {
  const { saveLoginDetails } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIdentifier, password }) => loginUser(userIdentifier, password),
    onSuccess: (data) => {
      // Save auth details
      saveLoginDetails(data.user, data.token, data.refreshToken);

      toast.success(`Welcome back, ${data.user.name}!`, {
        duration: TOAST_DURATION.SUCCESS,
      });

      // Clear any cached queries to fetch fresh data
      queryClient.invalidateQueries();

      // Check if user needs approval
      if (data.user.status === 'PENDING_APPROVAL') {
        navigate('/pending-approval');
      } else {
        // Navigate to role-based dashboard
        const redirectPath = getRoleBasedPath(data.user.role);
        navigate(redirectPath);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed. Please check your credentials.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();

      // Call context logout (clears localStorage and state)
      logout();

      toast.success('Logged out successfully', {
        duration: TOAST_DURATION.SUCCESS,
      });

      navigate('/');
    },
    onError: () => {
      // Even if API call fails, logout locally
      queryClient.clear();
      logout();
      navigate('/');
    },
  });
};

/**
 * Hook for token validation
 * Why query? Reads server state (doesn't modify)
 */
export const useValidateToken = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH_VALIDATE,
    queryFn: validateToken,
    // Only validate once per session unless explicitly refetched
    staleTime: Infinity,
    cacheTime: Infinity,
    // Don't automatically refetch
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Don't retry on failure (invalid token should fail immediately)
    retry: false,
  });
};

/**
 * Hook for password reset request
 */
export const useRequestPasswordReset = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      toast.success('Password reset link sent! Please check your email/phone.', {
        duration: TOAST_DURATION.SUCCESS,
      });
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reset link. Please try again.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook for resetting password with token
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password reset successful! Please login with your new password.', {
        duration: TOAST_DURATION.SUCCESS,
      });
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Password reset failed. Please try again.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook for changing password (authenticated)
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }) => changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password. Please check your current password.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook for getting current user profile
 */
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.AUTH_USER,
    queryFn: getCurrentUser,
    // Only fetch if authenticated
    enabled: isAuthenticated && !!user,
    // Keep data fresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for updating user profile
 */
export const useUpdateProfile = () => {
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update auth context with new data
      updateUser(data);

      // Invalidate user query to refetch
      queryClient.invalidateQueries(QUERY_KEYS.AUTH_USER);

      toast.success('Profile updated successfully!', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile. Please try again.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

// Helper function to get role-based redirect path
const getRoleBasedPath = (role) => {
  const pathMap = {
    ROLE_SUPER_ADMIN: '/admin/dashboard',
    ROLE_ORG_ADMIN: '/org-admin/dashboard',
    ROLE_VENDOR: '/vendor/dashboard',
    ROLE_EMPLOYEE: '/employee/menu',
  };
  return pathMap[role] || '/';
};
