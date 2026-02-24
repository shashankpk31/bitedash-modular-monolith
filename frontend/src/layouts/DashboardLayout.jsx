import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { UI_CONFIG } from "../config/constants";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";
import MobileBottomNav from "./MobileBottomNav";

const DashboardLayout = ({ navigationLinks, brandName = "BiteDash" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is employee (show mobile bottom nav)
  const isEmployee = user?.role === "EMPLOYEE";

  const handleNavClick = (path) => {
    if (location.pathname === path) return;
    navigate(path);
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout(); // This will clear auth state and localStorage
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-screen bg-surface-bg">
      {/* Mobile Menu Button - Fixed position */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Responsive */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 bg-gray-900 text-white flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo.svg" alt={brandName} className="h-10 w-10 md:h-12 md:w-12" />
            <span className="text-xl md:text-2xl font-black text-brand-primary tracking-tighter">
              {brandName}
            </span>
          </div>
          <NotificationBell />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 md:p-6 space-y-2 md:space-y-3 overflow-y-auto">
          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`
                  w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl
                  transition-all group min-h-[44px]
                  ${isActive ? "bg-brand-primary text-white" : "hover:bg-gray-800 text-gray-400"}
                `}
              >
                <span className={isActive ? "text-white" : "group-hover:text-brand-primary"}>
                  {link.icon}
                </span>
                <span className={`font-semibold text-sm md:text-base ${isActive ? "text-white" : "text-gray-300"}`}>
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 md:p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all hover:bg-red-900 text-gray-400 hover:text-white group min-h-[44px]"
          >
            <LogOut size={20} className="group-hover:text-white" />
            <span className="font-semibold text-sm md:text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation - Only for Employees */}
        {isEmployee && <MobileBottomNav />}
      </main>
    </div>
  );
};

export default DashboardLayout;