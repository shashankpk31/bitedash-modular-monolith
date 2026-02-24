import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orgAdminService } from '../services/orgAdminService';
import { Button } from '../../../components/ui/Button';
import {
  Plus,
  MapPin,
  Building2,
  UtensilsCrossed,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../config/constants';

const OrgDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user || user.role !== ROLES.ORG_ADMIN) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-red-500 font-semibold">Access Denied: Organization Admin role required</p>
      </div>
    );
  }

  const orgId = user.organizationId;

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: orgAdminService.getDashboardStats,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!orgId, // Only fetch if orgId exists
  });

  const {
    data: locations = [],
    isLoading: locationsLoading
  } = useQuery({
    queryKey: ['locations', orgId],
    queryFn: () => orgAdminService.getAllLocations(orgId),
    enabled: !!orgId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isLoading = statsLoading || locationsLoading;

  const stats = React.useMemo(() => ({
    locations: statsData?.locations || 0,
    offices: statsData?.offices || 0,
    cafeterias: statsData?.cafeterias || 0
  }), [statsData]);

  if (!orgId) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-semibold">Error: Organization ID not found in user profile</p>
        <p className="text-gray-500 text-sm">Please contact support or log in again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  if (statsError) {
    console.error('Stats error:', statsError);
  }

  return (
    <div className="space-y-8">
      {}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Organization Dashboard</h1>
          <p className="text-gray-500 font-medium mt-2">
            Manage your organization's locations, offices, and cafeterias.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/org-admin/locations')}
        >
          <Plus className="mr-2" size={20} /> Add Location
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<MapPin />}
          label="Locations"
          value={stats.locations}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Building2 />}
          label="Offices"
          value={stats.offices}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<UtensilsCrossed />}
          label="Cafeterias"
          value={stats.cafeterias}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-brand-primary/10">
            <TrendingUp className="text-brand-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Common tasks for managing your organization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            icon={<MapPin />}
            title="Add Location"
            description="Create a new location/city"
            onClick={() => navigate('/org-admin/locations')}
          />
          <QuickActionCard
            icon={<Building2 />}
            title="View Locations"
            description="Manage offices and cafeterias"
            onClick={() => navigate('/org-admin/locations')}
          />
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Your Locations</h2>
          <p className="text-sm text-gray-500 mt-1">
            {locations.length === 0
              ? 'No locations yet. Create your first location to get started.'
              : `Managing ${locations.length} location${locations.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {locations.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-6 font-bold text-gray-600">City</th>
                <th className="p-6 font-bold text-gray-600">State</th>
                <th className="p-6 font-bold text-gray-600">Offices</th>
                <th className="p-6 font-bold text-gray-600">Cafeterias</th>
                <th className="p-6 font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr
                  key={location.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-6 font-semibold text-gray-800">{location.cityName}</td>
                  <td className="p-6 text-gray-600">{location.state || 'N/A'}</td>
                  <td className="p-6 text-gray-400 text-sm">
                    {location.officeCount || 0}
                  </td>
                  <td className="p-6 text-gray-400 text-sm">
                    {location.cafeteriaCount || 0}
                  </td>
                  <td className="p-6 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/org-admin/locations/${location.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/org-admin/locations')}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <MapPin className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Locations Yet</h3>
            <p className="text-gray-400 mb-6">
              Start by creating your first location to organize your offices and cafeterias.
            </p>
            <Button variant="primary" onClick={() => navigate('/org-admin/locations')}>
              <Plus className="mr-2" size={20} /> Create First Location
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bgColor, clickable, onClick }) => (
  <div
    className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 ${
      clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
    }`}
    onClick={clickable ? onClick : undefined}
  >
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

const QuickActionCard = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group"
  >
    <div className="p-3 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-brand-primary group-hover:text-white transition-colors">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </button>
);

export default OrgDashboard;
