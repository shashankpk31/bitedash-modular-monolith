import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts';
import { PageLoader } from './Spinner';

/**
 * ProtectedRoute - Guards routes based on authentication and authorization
 * Why? Prevents unauthorized access to protected pages
 *
 * Usage:
 * <Route path="/admin/*" element={<ProtectedRoute requiredRoles={[ROLES.SUPER_ADMIN]} />}>
 *   <Route path="dashboard" element={<AdminDashboard />} />
 * </Route>
 */
const ProtectedRoute = ({ children, requiredRoles = [], requireApproval = true }) => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication status
  // Why? Prevents flash of wrong content during initialization
  if (isInitializing) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Not authenticated - redirect to login with return URL
  // Why preserve location? User can return to intended page after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs approval (except for pending approval page itself)
  if (
    requireApproval &&
    user.status === 'PENDING_APPROVAL' &&
    location.pathname !== '/pending-approval'
  ) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Check role-based authorization
  // Why? Different users should only access their designated areas
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // User doesn't have required role - redirect to their appropriate dashboard
    const roleRoutes = {
      ROLE_SUPER_ADMIN: '/admin/dashboard',
      ROLE_ORG_ADMIN: '/org-admin/dashboard',
      ROLE_VENDOR: '/vendor/dashboard',
      ROLE_EMPLOYEE: '/employee/menu',
    };

    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  // All checks passed - render children
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  requireApproval: PropTypes.bool,
};

/**
 * PublicOnlyRoute - Redirects authenticated users (for login/register pages)
 * Why? Logged-in users shouldn't see login/register pages
 */
export const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <PageLoader message="Loading..." />;
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    // Check if there's a return URL from previous navigation
    const from = location.state?.from?.pathname;
    if (from && from !== '/') {
      return <Navigate to={from} replace />;
    }

    // Check if user needs approval
    if (user.status === 'PENDING_APPROVAL') {
      return <Navigate to="/pending-approval" replace />;
    }

    // Redirect to role-based dashboard
    const roleRoutes = {
      ROLE_SUPER_ADMIN: '/admin/dashboard',
      ROLE_ORG_ADMIN: '/org-admin/dashboard',
      ROLE_VENDOR: '/vendor/dashboard',
      ROLE_EMPLOYEE: '/employee/menu',
    };

    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return children;
};

PublicOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
