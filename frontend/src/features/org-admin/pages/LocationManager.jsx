import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgAdminService } from '../services/orgAdminService';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  MapPin,
  Plus,
  Building2,
  UtensilsCrossed,
  Loader2,
  Edit2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LocationManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    cityName: '',
    state: ''
  });

  const user = JSON.parse(localStorage.getItem('hb_user') || '{}');
  const orgId = user.organizationId;

  const {
    data: locations = [],
    isLoading
  } = useQuery({
    queryKey: ['locations', orgId],
    queryFn: () => orgAdminService.getAllLocations(orgId),
    enabled: !!orgId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: orgAdminService.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      setShowModal(false);
      resetForm();
      toast.success('Location created successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create location');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => orgAdminService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      setShowModal(false);
      resetForm();
      toast.success('Location updated successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update location');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: orgAdminService.deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      toast.success('Location deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete location');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingLocation ? 'Updating location...' : 'Creating location...');

    if (editingLocation) {
      updateMutation.mutate(
        { id: editingLocation.id, data: formData },
        { onSettled: () => toast.dismiss(loadingToast) }
      );
    } else {
      createMutation.mutate(formData, {
        onSettled: () => toast.dismiss(loadingToast)
      });
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      cityName: location.cityName || '',
      state: location.state || ''
    });
    setShowModal(true);
  };

  const handleDelete = (locationId) => {
    if (window.confirm('Are you sure you want to delete this location? This will also delete all associated offices and cafeterias.')) {
      deleteMutation.mutate(locationId);
    }
  };

  const resetForm = () => {
    setFormData({ cityName: '', state: '' });
    setEditingLocation(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="font-bold animate-pulse">Loading Locations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Location Management</h1>
          <p className="text-gray-500 font-medium mt-2">
            Manage locations where your organization operates
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="mr-2" size={20} /> Add Location
        </Button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<MapPin />}
          label="Total Locations"
          value={locations.length}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Building2 />}
          label="Total Offices"
          value={locations.reduce((sum, loc) => sum + (loc.officeCount || 0), 0)}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<UtensilsCrossed />}
          label="Total Cafeterias"
          value={locations.reduce((sum, loc) => sum + (loc.cafeteriaCount || 0), 0)}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={() => navigate(`/org-admin/locations/${location.id}`)}
          />
        ))}

        {locations.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <MapPin className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Locations Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first location to start organizing offices and cafeterias.
            </p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus className="mr-2" size={20} /> Create First Location
            </Button>
          </div>
        )}
      </div>

      {}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingLocation ? 'Edit Location' : 'Create New Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="City Name"
            name="cityName"
            value={formData.cityName}
            onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
            placeholder="e.g., Bangalore"
            required
          />
          <Input
            label="State/Province"
            name="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="e.g., Karnataka"
            required
          />

          {}
          <div className="flex gap-3 pt-6 border-t border-gray-100 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 pb-6 bg-gray-50 sticky bottom-0">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingLocation ? 'Update Location' : 'Create Location'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bgColor }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

const LocationCard = ({ location, onEdit, onDelete, onViewDetails }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
          <MapPin size={24} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(location)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(location.id)}
            className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1">{location.cityName}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {location.state || 'No state specified'}
      </p>

      <div className="flex gap-4 mb-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">
            {location.officeCount || 0} {(location.officeCount || 0) === 1 ? 'Office' : 'Offices'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={16} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">
            {location.cafeteriaCount || 0} {(location.cafeteriaCount || 0) === 1 ? 'Cafeteria' : 'Cafeterias'}
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full group"
        onClick={onViewDetails}
      >
        View Details
        <ChevronRight size={18} className="ml-auto group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  </div>
);

export default LocationManager;
