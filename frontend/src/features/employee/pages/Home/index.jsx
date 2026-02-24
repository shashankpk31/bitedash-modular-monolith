import React from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useLocation } from "../../../../context/LocationContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Edit2, RefreshCw } from "lucide-react";
import VendorList from "../../components/VendorList";
import usePullToRefresh from "../../../../hooks/usePullToRefresh";
import PullToRefreshIndicator from "../../../../components/pwa/PullToRefreshIndicator";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const EmployeeHome = () => {
  const { user } = useAuth();
  const { cafeteriaName, officeName, isConfigured } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Pull to refresh functionality
  const handleRefresh = async () => {
    try {
      // Invalidate all queries to refetch data
      await queryClient.invalidateQueries(['vendors']);
      await queryClient.invalidateQueries(['vendor-ratings']);
      toast.success('Refreshed!');
    } catch (error) {
      toast.error('Failed to refresh');
    }
  };

  const { containerRef, isRefreshing, pullDistance, threshold } = usePullToRefresh(
    handleRefresh,
    { enabled: true }
  );

  // Redirect to welcome if location not configured
  React.useEffect(() => {
    if (!isConfigured) {
      navigate('/employee/welcome', { replace: true });
    }
  }, [isConfigured, navigate]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 overflow-auto">
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        threshold={threshold}
      />

      {/* Hero Section - More compact on mobile */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            Welcome, {user?.username || "Employee"}!
          </h1>
          <p className="text-base md:text-xl opacity-90 mb-4">
            Order delicious food from your workplace cafeteria
          </p>

          {/* Location Info */}
          {cafeteriaName && (
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4 mt-4">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="flex-shrink-0" />
                <div>
                  <p className="text-sm opacity-75">Current Location</p>
                  <p className="font-semibold">{cafeteriaName}</p>
                  {officeName && (
                    <p className="text-xs opacity-75">{officeName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/employee/welcome')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Change location"
              >
                <Edit2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-12">
        {/* Vendors List */}
        <VendorList />
      </div>
    </div>
  );
};

export default EmployeeHome;
