import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Store, Search, Star, Loader2, MapPin, User, AlertCircle } from 'lucide-react';
import catalogService from '../services/catalogService';
import toast from 'react-hot-toast';

const VendorList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Get cafeteriaId from location context
  // If you haven't imported useLocation at the top, add: import { useLocation } from '../../../context/LocationContext';
  // For now, keeping it simple with direct localStorage access
  const getStoredLocation = () => {
    try {
      const stored = localStorage.getItem('bitedash_location_prefs');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.cafeteriaId || null;
      }
    } catch (error) {
      console.error('Failed to load location:', error);
    }
    return null;
  };

  const cafeteriaId = getStoredLocation();

  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ['vendors', cafeteriaId],
    queryFn: async () => {
      if (!cafeteriaId) {
        return [];
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089'}/organisation/vendors/stalls/cafeteria/${cafeteriaId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('hb_token')}`,
          }
        });
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (err) {
        toast.error('Failed to fetch vendors');
        return [];
      }
    },
    enabled: !!cafeteriaId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch ratings for all vendors
  const { data: ratingsMap } = useQuery({
    queryKey: ['vendor-ratings', vendors],
    queryFn: async () => {
      if (!vendors || vendors.length === 0) return {};

      const ratingsPromises = vendors.map(async (vendor) => {
        try {
          const rating = await catalogService.getVendorRating(vendor.ownerUserId);
          return { vendorId: vendor.id, rating };
        } catch (err) {
          return { vendorId: vendor.id, rating: null };
        }
      });

      const ratingsArray = await Promise.all(ratingsPromises);
      return ratingsArray.reduce((acc, { vendorId, rating }) => {
        acc[vendorId] = rating;
        return acc;
      }, {});
    },
    enabled: !!vendors && vendors.length > 0,
    retry: 1,
  });

  // Filter vendors based on search
  const filteredVendors = vendors?.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.stallNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleVendorClick = (vendor) => {
    navigate(`/employee/vendor/${vendor.ownerUserId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Vendors</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vendors by name or stall number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Vendors Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Available Vendors ({filteredVendors.length})
        </h2>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Store className="text-gray-400 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vendors Found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'No vendors available in your cafeteria at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const rating = ratingsMap?.[vendor.id];

            return (
              <div
                key={vendor.id}
                onClick={() => handleVendorClick(vendor)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-brand-primary transition-all cursor-pointer group"
              >
                {/* Vendor Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Store className="text-white" size={32} />
                </div>

                {/* Vendor Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                  {vendor.name}
                </h3>

                <div className="space-y-2 mb-4">
                  {/* Stall Number */}
                  {vendor.stallNumber && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-2 text-gray-400" />
                      <span>Stall #{vendor.stallNumber}</span>
                    </div>
                  )}

                  {/* Contact Person */}
                  {vendor.contactPerson && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <User size={16} className="mr-2 text-gray-400" />
                      <span>{vendor.contactPerson}</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center">
                    {rating ? (
                      <>
                        <Star className="text-yellow-400 fill-yellow-400 mr-1" size={16} />
                        <span className="text-gray-900 font-semibold">
                          {rating.averageRating?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({rating.totalOrders || 0} orders)
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">No ratings yet</span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      vendor.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {vendor.isActive ? 'Open' : 'Closed'}
                  </span>

                  <button className="text-brand-primary font-semibold text-sm group-hover:underline">
                    View Menu →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorList;
