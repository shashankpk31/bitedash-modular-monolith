import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../config/constants";
import { LayoutDashboard, Building2, MapPin, CheckCircle, Store, ShoppingCart, Package, UtensilsCrossed } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";

import LandingPage from "../features/home/pages/LandingPage";
import SuperAdminOverview from "../features/admin/pages/SuperAdminOverview";
import OrganizationManager from "../features/admin/pages/OrganizationManager";
import ApprovalDashboard from "../features/org-admin/pages/ApprovalDashboard";
import OrgDashboard from "../features/org-admin/pages/OrgDashboard";
import LocationManager from "../features/org-admin/pages/LocationManager";
import LocationDetails from "../features/org-admin/pages/LocationDetails";

// Vendor Pages
import VendorDashboard from "../features/vendor/pages/Dashboard";
import LiveOrders from "../features/vendor/pages/LiveOrders";
import MenuManagement from "../features/vendor/pages/MenuManagement";
import QRScanner from "../features/vendor/pages/QRScanner";

// Employee Pages
import EmployeeHome from "../features/employee/pages/Home";
import Welcome from "../features/employee/pages/Welcome";
import Cart from "../features/employee/pages/Cart";
import Tracking from "../features/employee/pages/Tracking";
import VendorDetail from "../features/employee/pages/VendorDetail";
import EmployeeWallet from "../features/employee/pages/Wallet";

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
      {}
      <Route path="/" element={<LandingPage />} />

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
          <Route path="admin/dashboard" element={<SuperAdminOverview />} />
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
          <Route path="org-admin/dashboard" element={<OrgDashboard />} />
          <Route path="org-admin/locations" element={<LocationManager />} />
          <Route path="org-admin/locations/:locationId" element={<LocationDetails />} />
          <Route path="org-admin/approvals" element={<ApprovalDashboard />} />
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
          <Route path="vendor/menu" element={<MenuManagement />} />
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
          <Route path="employee/home" element={<EmployeeHome />} />
          <Route path="employee/cart" element={<Cart />} />
          <Route path="employee/tracking" element={<Tracking />} />
          <Route path="employee/wallet" element={<EmployeeWallet />} />
          <Route path="employee/vendor/:vendorId" element={<VendorDetail />} />
          <Route
            path="employee"
            element={<Navigate to="/employee/home" replace />}
          />
        </Route>
      </Route>

      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
