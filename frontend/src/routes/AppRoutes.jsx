import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../config/constants";
import { LayoutDashboard, Building2, MapPin, CheckCircle, Store, ShoppingCart, Package, UtensilsCrossed } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";

// Landing & Auth
import ResponsiveLanding from "../features/home/pages/ResponsiveLanding";
import LoginMobile from "../features/auth/pages/LoginMobile";
import UnifiedRegister from "../features/auth/pages/UnifiedRegister";

// Super Admin Pages (NEW)
import SuperAdminDashboardNew from "../features/admin/pages/SuperAdminDashboardNew";
import OrganizationManager from "../features/admin/pages/OrganizationManager";

// Org Admin Pages
import OrgAdminDashboardNew from "../features/org-admin/pages/OrgAdminDashboardNew";
import OrganizationRegistration from "../features/org-admin/pages/OrganizationRegistration";
import ApprovalDashboardPage from "../features/org-admin/pages/ApprovalDashboardPage";
import LocationManager from "../features/org-admin/pages/LocationManager";
import LocationDetails from "../features/org-admin/pages/LocationDetails";

// Vendor Pages
import VendorDashboard from "../features/vendor/pages/VendorDashboard";
import MenuManagementPage from "../features/vendor/pages/MenuManagementPage";
import VendorRegistration from "../features/vendor/pages/VendorRegistration";
import LiveOrders from "../features/vendor/pages/LiveOrders";
import QRScanner from "../features/vendor/pages/QRScanner";

// Employee Pages
import MenuHomePage from "../features/employee/pages/MenuHomePage";
import CartPage from "../features/employee/pages/CartPage";
import OrderConfirmationPage from "../features/employee/pages/OrderConfirmationPage";
import OrderHistoryPage from "../features/employee/pages/OrderHistoryPage";
import WalletPage from "../features/employee/pages/WalletPage";
import Welcome from "../features/employee/pages/Welcome";
import Tracking from "../features/employee/pages/Tracking";
import VendorDetail from "../features/employee/pages/VendorDetail";

const AppRoutes = () => {
  const superAdminNav = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Organizations",
      path: "/admin/organizations",
      icon: <Building2 size={20} />,
    },
  ];

  const orgAdminNav = [
    {
      label: "Dashboard",
      path: "/org-admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Locations",
      path: "/org-admin/locations",
      icon: <MapPin size={20} />,
    },
    {
      label: "Pending Approvals",
      path: "/org-admin/approvals",
      icon: <CheckCircle size={20} />,
    },
  ];

  const vendorNav = [
    {
      label: "Dashboard",
      path: "/vendor/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Live Orders",
      path: "/vendor/orders",
      icon: <ShoppingCart size={20} />,
    },
    {
      label: "Menu",
      path: "/vendor/menu",
      icon: <UtensilsCrossed size={20} />,
    },
    {
      label: "QR Scanner",
      path: "/vendor/qr-scanner",
      icon: <Package size={20} />,
    },
  ];

  const employeeNav = [
    {
      label: "Home",
      path: "/employee/home",
      icon: <Store size={20} />,
    },
    {
      label: "Cart",
      path: "/employee/cart",
      icon: <ShoppingCart size={20} />,
    },
    {
      label: "Track Order",
      path: "/employee/tracking",
      icon: <MapPin size={20} />,
    },
  ];

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<ResponsiveLanding />} />
      <Route path="/login" element={<LoginMobile />} />
      <Route path="/register" element={<UnifiedRegister />} />
      <Route path="/register/organization" element={<OrganizationRegistration />} />

      {}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
        <Route
          element={
            <DashboardLayout
              navigationLinks={superAdminNav}
              brandName="BiteDash Super"
            />
          }
        >
          <Route path="admin/dashboard" element={<SuperAdminDashboardNew />} />
          <Route path="admin/organizations" element={<OrganizationManager />} />
          {}
          <Route
            path="admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>
      </Route>

      {}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ORG_ADMIN]} />}>
        <Route
          element={
            <DashboardLayout
              navigationLinks={orgAdminNav}
              brandName="BiteDash Org"
            />
          }
        >
          <Route path="org-admin/dashboard" element={<OrgAdminDashboardNew />} />
          <Route path="org-admin/locations" element={<LocationManager />} />
          <Route path="org-admin/locations/:locationId" element={<LocationDetails />} />
          <Route path="org-admin/approvals" element={<ApprovalDashboardPage />} />
          <Route
            path="org-admin"
            element={<Navigate to="/org-admin/dashboard" replace />}
          />
        </Route>
      </Route>

      {/* Vendor Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.VENDOR]} />}>
        <Route
          element={
            <DashboardLayout
              navigationLinks={vendorNav}
              brandName="BiteDash Vendor"
            />
          }
        >
          <Route path="vendor/dashboard" element={<VendorDashboard />} />
          <Route path="vendor/orders" element={<LiveOrders />} />
          <Route path="vendor/menu" element={<MenuManagementPage />} />
          <Route path="vendor/qr-scanner" element={<QRScanner />} />
          <Route
            path="vendor"
            element={<Navigate to="/vendor/dashboard" replace />}
          />
        </Route>
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
        {/* Welcome screen - no layout */}
        <Route path="employee/welcome" element={<Welcome />} />

        <Route
          element={
            <DashboardLayout
              navigationLinks={employeeNav}
              brandName="BiteDash"
            />
          }
        >
          <Route path="employee/menu" element={<MenuHomePage />} />
          <Route path="employee/cart" element={<CartPage />} />
          <Route path="employee/orders" element={<OrderHistoryPage />} />
          <Route path="employee/orders/:orderId" element={<OrderConfirmationPage />} />
          <Route path="employee/wallet" element={<WalletPage />} />
          <Route path="employee/tracking" element={<Tracking />} />
          <Route path="employee/vendor/:vendorId" element={<VendorDetail />} />
          {/* Legacy route redirect */}
          <Route path="employee/home" element={<Navigate to="/employee/menu" replace />} />
          <Route
            path="employee"
            element={<Navigate to="/employee/menu" replace />}
          />
        </Route>
      </Route>

      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
