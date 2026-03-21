import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute, PageLoader } from '../common/components';
import { ROLES } from '../config/constants';

// Layouts - Not lazy loaded (needed for route structure)
import EmployeeLayout from '../layouts/EmployeeLayout';
import VendorLayout from '../layouts/VendorLayout';
import AdminLayout from '../layouts/AdminLayout';

// Landing & Auth Pages - Lazy loaded for code splitting
const ResponsiveLanding = lazy(() => import('../features/home/pages/ResponsiveLanding'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const VerificationPage = lazy(() => import('../features/auth/pages/VerificationPage'));
const PendingApprovalPage = lazy(() => import('../features/auth/pages/PendingApprovalPage'));

// Employee Pages - Lazy loaded
const MenuHomePage = lazy(() => import('../features/employee/pages/MenuHomePage'));
const VendorDetailPage = lazy(() => import('../features/employee/pages/VendorDetailPage'));
const CartPage = lazy(() => import('../features/employee/pages/CartPage'));
const OrderConfirmationPage = lazy(() => import('../features/employee/pages/OrderConfirmationPage'));
const OrderHistoryPage = lazy(() => import('../features/employee/pages/OrderHistoryPage'));
const WalletPage = lazy(() => import('../features/employee/pages/WalletPage'));
const ProfilePage = lazy(() => import('../features/employee/pages/ProfilePage'));

// Vendor Pages - Lazy loaded
const VendorDashboardPage = lazy(() => import('../features/vendor/pages/VendorDashboardPage'));
const LiveOrdersPage = lazy(() => import('../features/vendor/pages/LiveOrdersPage'));
const MenuManagementPage = lazy(() => import('../features/vendor/pages/MenuManagementPage'));
const InventoryManagementPage = lazy(() => import('../features/vendor/pages/InventoryManagementPage'));
const QRScannerPage = lazy(() => import('../features/vendor/pages/QRScannerPage'));
const VendorProfilePage = lazy(() => import('../features/vendor/pages/VendorProfilePage'));

// Org Admin Pages - Lazy loaded
const OrgAdminDashboardPage = lazy(() => import('../features/org-admin/pages/OrgAdminDashboardPage'));
const LocationManagerPage = lazy(() => import('../features/org-admin/pages/LocationManagerPage'));
const ApprovalDashboardPage = lazy(() => import('../features/org-admin/pages/ApprovalDashboardPage'));

// Super Admin Pages - Lazy loaded
const SuperAdminDashboardPage = lazy(() => import('../features/admin/pages/SuperAdminDashboardPage'));
const OrganizationManagerPage = lazy(() => import('../features/admin/pages/OrganizationManagerPage'));

// Temporary placeholder component for pages under development
const ComingSoon = ({ role }) => (
  <div className="min-h-screen bg-surface flex items-center justify-center p-4">
    <div className="text-center space-y-4">
      <h1 className="font-headline text-display-lg text-on-surface">Coming Soon</h1>
      <p className="text-body-lg text-on-surface-variant">
        {role} dashboard is under construction
      </p>
      <p className="text-body-md text-on-surface-variant">
        Phase 2 (Employee) complete. Phase 3 will add {role} features.
      </p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    // Suspense wrapper for lazy-loaded routes
    // Why? Provides fallback UI while code splits are loading
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Public Routes - Accessible only when NOT logged in */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <ResponsiveLanding />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Verification route - public but requires identifier from registration */}
      <Route path="/verify" element={<VerificationPage />} />

      {/* Pending Approval - Protected but doesn't require approved status */}
      <Route
        path="/pending-approval"
        element={
          <ProtectedRoute requireApproval={false}>
            <PendingApprovalPage />
          </ProtectedRoute>
        }
      />

      {/* Employee Routes - Phase 2 COMPLETE */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute requiredRoles={[ROLES.EMPLOYEE]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/employee/menu" replace />} />

        {/* Main pages */}
        <Route path="menu" element={<MenuHomePage />} />
        <Route path="vendor/:vendorId" element={<VendorDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<OrderHistoryPage />} />
        <Route path="orders/:orderId" element={<OrderConfirmationPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Legacy routes - redirect to new paths */}
        <Route path="home" element={<Navigate to="/employee/menu" replace />} />
      </Route>

      {/* Super Admin Routes - Phase 4 COMPLETE */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={[ROLES.SUPER_ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* Main pages */}
        <Route path="dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="organizations" element={<OrganizationManagerPage />} />
        <Route path="settings" element={<ComingSoon role="Super Admin Settings" />} />
      </Route>

      {/* Org Admin Routes - Phase 4 COMPLETE */}
      <Route
        path="/org-admin"
        element={
          <ProtectedRoute requiredRoles={[ROLES.ORG_ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/org-admin/dashboard" replace />} />

        {/* Main pages */}
        <Route path="dashboard" element={<OrgAdminDashboardPage />} />
        <Route path="locations" element={<LocationManagerPage />} />
        <Route path="approvals" element={<ApprovalDashboardPage />} />
        <Route path="employees" element={<ComingSoon role="Employee Manager" />} />
      </Route>

      {/* Vendor Routes - Phase 3 COMPLETE */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute requiredRoles={[ROLES.VENDOR]}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />

        {/* Main pages */}
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="orders" element={<LiveOrdersPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="inventory" element={<InventoryManagementPage />} />
        <Route path="qr-scanner" element={<QRScannerPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
