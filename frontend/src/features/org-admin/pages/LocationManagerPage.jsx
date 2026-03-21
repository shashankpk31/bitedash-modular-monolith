import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Building, Coffee, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import Select from '../../../common/components/Select';
import Badge from '../../../common/components/Badge';
import Modal, { ConfirmModal } from '../../../common/components/Modal';
import { ContentLoader } from '../../../common/components/Spinner';
import { useAuth } from '../../../contexts';
import {
  getLocationsByOrganization,
  getOfficesByLocation,
  getCafeteriasByOffice,
  createLocation,
  updateLocation,
  deleteLocation,
  createOffice,
  updateOffice,
  deleteOffice,
  createCafeteria,
  updateCafeteria,
  deleteCafeteria,
} from '../../../services/api/organization.api';
import { QUERY_KEYS } from '../../../config/constants';

// Location Manager Page - CRUD for locations, offices, and cafeterias
// Why? Org admins need to manage their organization's location hierarchy
const LocationManagerPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('locations'); // locations, offices, cafeterias
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: [QUERY_KEYS.LOCATIONS, user?.organizationId],
    queryFn: () => getLocationsByOrganization(user?.organizationId),
    enabled: !!user?.organizationId && viewMode === 'locations',
  });

  // Fetch offices (when viewing offices)
  const { data: allOffices = [], isLoading: officesLoading } = useQuery({
    queryKey: [QUERY_KEYS.OFFICES, 'all'],
    queryFn: async () => {
      if (!locations || locations.length === 0) return [];
      // Fetch offices for all locations
      const officePromises = locations.map(loc => getOfficesByLocation(loc.id));
      const officeArrays = await Promise.all(officePromises);
      return officeArrays.flat().map(office => ({
        ...office,
        locationName: locations.find(l => l.id === office.locationId)?.cityName || 'Unknown',
      }));
    },
    enabled: !!locations && locations.length > 0 && viewMode === 'offices',
  });

  // Fetch cafeterias (when viewing cafeterias)
  const { data: allCafeterias = [], isLoading: cafeteriasLoading } = useQuery({
    queryKey: [QUERY_KEYS.CAFETERIAS, 'all'],
    queryFn: async () => {
      if (!allOffices || allOffices.length === 0) return [];
      // Fetch cafeterias for all offices
      const cafeteriaPromises = allOffices.map(office => getCafeteriasByOffice(office.id));
      const cafeteriaArrays = await Promise.all(cafeteriaPromises);
      return cafeteriaArrays.flat().map(caf => ({
        ...caf,
        officeName: allOffices.find(o => o.id === caf.officeId)?.officeName || 'Unknown',
      }));
    },
    enabled: !!allOffices && allOffices.length > 0 && viewMode === 'cafeterias',
  });

  const isLoading = locationsLoading || officesLoading || cafeteriasLoading;

  // Mutations for CRUD operations
  const createLocationMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.LOCATIONS]);
      setShowAddModal(false);
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, data }) => updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.LOCATIONS]);
      setShowEditModal(false);
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.LOCATIONS]);
      setShowDeleteConfirm(false);
    },
  });

  const createOfficeMutation = useMutation({
    mutationFn: createOffice,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.OFFICES]);
      setShowAddModal(false);
    },
  });

  const updateOfficeMutation = useMutation({
    mutationFn: ({ id, data }) => updateOffice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.OFFICES]);
      setShowEditModal(false);
    },
  });

  const deleteOfficeMutation = useMutation({
    mutationFn: deleteOffice,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.OFFICES]);
      setShowDeleteConfirm(false);
    },
  });

  const createCafeteriaMutation = useMutation({
    mutationFn: createCafeteria,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CAFETERIAS]);
      setShowAddModal(false);
    },
  });

  const updateCafeteriaMutation = useMutation({
    mutationFn: ({ id, data }) => updateCafeteria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CAFETERIAS]);
      setShowEditModal(false);
    },
  });

  const deleteCafeteriaMutation = useMutation({
    mutationFn: deleteCafeteria,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CAFETERIAS]);
      setShowDeleteConfirm(false);
    },
  });

  // Get current data based on view mode
  const getCurrentData = () => {
    switch (viewMode) {
      case 'offices':
        return allOffices;
      case 'cafeterias':
        return allCafeterias;
      default:
        return locations;
    }
  };

  // Filter data by search
  const filteredData = getCurrentData().filter(item => {
    const searchLower = searchQuery.toLowerCase();
    if (viewMode === 'locations') {
      return item.cityName?.toLowerCase().includes(searchLower);
    }
    return item.name?.toLowerCase().includes(searchLower);
  });

  // Handle actions
  const handleAdd = () => {
    setSelectedItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!selectedItem) return;

    switch (viewMode) {
      case 'locations':
        deleteLocationMutation.mutate(selectedItem.id);
        break;
      case 'offices':
        deleteOfficeMutation.mutate(selectedItem.id);
        break;
      case 'cafeterias':
        deleteCafeteriaMutation.mutate(selectedItem.id);
        break;
    }
    setSelectedItem(null);
  };

  // Form Component
  const LocationForm = ({ item, type, onClose }) => {
    const [formData, setFormData] = useState(item || {
      cityName: '',
      state: '',
      country: 'India',
      officeName: '',
      address: '',
      totalFloors: '',
      locationId: '',
      name: '',
      floorNumber: '',
      openingTime: '08:00',
      closingTime: '20:00',
      capacity: '',
      officeId: '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();

      if (type === 'Location') {
        const locationData = {
          orgId: user?.organizationId,
          cityName: formData.cityName,
          state: formData.state,
          country: formData.country || 'India',
        };
        if (item) {
          updateLocationMutation.mutate({ id: item.id, data: locationData });
        } else {
          createLocationMutation.mutate(locationData);
        }
      } else if (type === 'Office') {
        const officeData = {
          locationId: formData.locationId,
          officeName: formData.officeName,
          address: formData.address,
          totalFloors: parseInt(formData.totalFloors) || 0,
        };
        if (item) {
          updateOfficeMutation.mutate({ id: item.id, data: officeData });
        } else {
          createOfficeMutation.mutate(officeData);
        }
      } else if (type === 'Cafeteria') {
        const cafeteriaData = {
          officeId: formData.officeId,
          name: formData.name,
          floorNumber: parseInt(formData.floorNumber) || 0,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          capacity: parseInt(formData.capacity) || 0,
          isActive: true,
        };
        if (item) {
          updateCafeteriaMutation.mutate({ id: item.id, data: cafeteriaData });
        } else {
          createCafeteriaMutation.mutate(cafeteriaData);
        }
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'Location' && (
          <>
            <Input
              label="City Name"
              value={formData.cityName}
              onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
              required
              placeholder="e.g., Bangalore"
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
              placeholder="e.g., Karnataka"
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="India"
            />
          </>
        )}

        {type === 'Office' && (
          <>
            <Input
              label="Office Name"
              value={formData.officeName}
              onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
              required
              placeholder="e.g., Tech Park Building A"
            />
            <Select
              label="Location"
              placeholder="Select location"
              options={locations.map(loc => ({
                value: loc.id,
                label: loc.cityName,
              }))}
              value={formData.locationId}
              onChange={(value) => setFormData({ ...formData, locationId: value })}
              icon={MapPin}
              searchable
              required
            />
            <div>
              <label className="block text-label-md text-on-surface mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-surface-container-low text-on-surface rounded-xl p-4 border-2 border-outline-variant focus:border-primary focus:outline-none transition-colors min-h-[100px]"
                placeholder="Enter full address"
              />
            </div>
            <Input
              label="Total Floors"
              type="number"
              value={formData.totalFloors}
              onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
              placeholder="e.g., 5"
            />
          </>
        )}

        {type === 'Cafeteria' && (
          <>
            <Input
              label="Cafeteria Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Main Cafeteria"
            />
            <Select
              label="Office"
              placeholder="Select office"
              options={allOffices.map(office => ({
                value: office.id,
                label: `${office.officeName} - ${office.locationName}`,
              }))}
              value={formData.officeId}
              onChange={(value) => setFormData({ ...formData, officeId: value })}
              icon={Building}
              searchable
              required
            />
            <Input
              label="Floor Number"
              type="number"
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
              placeholder="e.g., 0 for Ground"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                type="time"
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              />
              <Input
                label="Closing Time"
                type="time"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              />
            </div>
            <Input
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="e.g., 200"
            />
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            {item ? 'Update' : 'Add'} {type}
          </Button>
        </div>
      </form>
    );
  };

  // Get icon and title for current view mode
  const getViewConfig = () => {
    switch (viewMode) {
      case 'offices':
        return { icon: Building, title: 'Offices', singular: 'Office' };
      case 'cafeterias':
        return { icon: Coffee, title: 'Cafeterias', singular: 'Cafeteria' };
      default:
        return { icon: MapPin, title: 'Locations', singular: 'Location' };
    }
  };

  const viewConfig = getViewConfig();
  const ViewIcon = viewConfig.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-outline-variant/30 bg-surface-container-low">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div>
            <h1 className="font-headline text-display-sm lg:text-display-md text-on-surface">
              Location Manager
            </h1>
            <p className="text-body-md lg:text-body-lg text-on-surface-variant mt-2">
              Manage locations, offices, and cafeterias
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={20} />}
            onClick={handleAdd}
          >
            Add {viewConfig.singular}
          </Button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 lg:gap-3 mt-6">
          {[
            { value: 'locations', label: 'Locations', icon: MapPin },
            { value: 'offices', label: 'Offices', icon: Building },
            { value: 'cafeterias', label: 'Cafeterias', icon: Coffee },
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setViewMode(tab.value)}
                className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-label-md lg:text-label-lg font-semibold transition-all shadow-sm ${
                  viewMode === tab.value
                    ? 'bg-primary text-on-primary shadow-primary'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-95'
                }`}
              >
                <TabIcon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-4">
          <Input
            type="search"
            placeholder={`Search ${viewConfig.title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
            iconPosition="left"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Loading */}
        {isLoading && <ContentLoader message={`Loading ${viewConfig.title.toLowerCase()}...`} />}

        {/* Empty State */}
        {!isLoading && filteredData.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
              <ViewIcon size={40} className="text-on-surface-variant opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-headline-sm text-on-surface">
                {searchQuery ? 'No Results Found' : `No ${viewConfig.title} Yet`}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                {searchQuery
                  ? 'Try a different search term'
                  : `Add your first ${viewConfig.singular.toLowerCase()} to get started`}
              </p>
            </div>
            {!searchQuery && (
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={handleAdd}
              >
                Add {viewConfig.singular}
              </Button>
            )}
          </div>
        )}

        {/* Data Grid */}
        {!isLoading && filteredData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredData.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="bg-surface-container-lowest rounded-xl p-4 shadow-card hover:shadow-ambient transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ViewIcon size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-headline text-body-lg text-on-surface">
                            {viewMode === 'locations' ? item.cityName : item.name || item.officeName}
                          </h3>
                          {viewMode === 'locations' && (
                            <p className="text-label-sm text-on-surface-variant mt-1">
                              {item.state}, {item.country}
                            </p>
                          )}
                          {viewMode === 'offices' && (
                            <p className="text-label-sm text-on-surface-variant mt-1">
                              {item.locationName} • {item.totalFloors} floors
                            </p>
                          )}
                          {viewMode === 'cafeterias' && (
                            <p className="text-label-sm text-on-surface-variant mt-1">
                              {item.officeName} • Floor {item.floorNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3">
                      {viewMode === 'cafeterias' && item.capacity && (
                        <Badge variant="info" size="sm">Capacity: {item.capacity}</Badge>
                      )}
                      {viewMode === 'cafeterias' && (
                        <Badge variant={item.isActive ? 'success' : 'error'} size="sm">
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDelete(item)}
                        className="text-error hover:bg-error/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add New ${viewConfig.singular}`}
        size="lg"
      >
        <LocationForm type={viewConfig.singular} onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        title={`Edit ${viewConfig.singular}`}
        size="lg"
      >
        <LocationForm
          item={selectedItem}
          type={viewConfig.singular}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmDelete}
        title={`Delete ${viewConfig.singular}?`}
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default LocationManagerPage;
