import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgAdminService } from '../services/orgAdminService';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  ArrowLeft,
  Building2,
  UtensilsCrossed,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const LocationDetails = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showCafeteriaModal, setShowCafeteriaModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [editingCafeteria, setEditingCafeteria] = useState(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);

  const [officeFormData, setOfficeFormData] = useState({
    officeName: '',
    address: ''
  });

  const [cafeteriaFormData, setCafeteriaFormData] = useState({
    name: '',
    floorNumber: ''
  });

  const {
    data: offices = [],
    isLoading: officesLoading
  } = useQuery({
    queryKey: ['offices', locationId],
    queryFn: () => orgAdminService.getOfficesByLocation(locationId),
    enabled: !!locationId,
    retry: 1
  });

  const {
    data: cafeterias = [],
    isLoading: cafeteriasLoading
  } = useQuery({
    queryKey: ['cafeterias', selectedOfficeId],
    queryFn: () => orgAdminService.getCafeteriasByOffice(selectedOfficeId),
    enabled: !!selectedOfficeId,
    retry: 1
  });

  const createOfficeMutation = useMutation({
    mutationFn: (data) => orgAdminService.createOffice(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['offices', locationId]);
      setShowOfficeModal(false);
      resetOfficeForm();
      toast.success('Office created successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create office');
    }
  });

  const updateOfficeMutation = useMutation({
    mutationFn: ({ id, data }) => orgAdminService.updateOffice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['offices', locationId]);
      setShowOfficeModal(false);
      resetOfficeForm();
      toast.success('Office updated successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update office');
    }
  });

  const deleteOfficeMutation = useMutation({
    mutationFn: orgAdminService.deleteOffice,
    onSuccess: () => {
      queryClient.invalidateQueries(['offices', locationId]);
      toast.success('Office deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete office');
    }
  });

  const createCafeteriaMutation = useMutation({
    mutationFn: (data) => orgAdminService.createCafeteria(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cafeterias', selectedOfficeId]);
      setShowCafeteriaModal(false);
      resetCafeteriaForm();
      toast.success('Cafeteria created successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create cafeteria');
    }
  });

  const updateCafeteriaMutation = useMutation({
    mutationFn: ({ id, data }) => orgAdminService.updateCafeteria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cafeterias', selectedOfficeId]);
      setShowCafeteriaModal(false);
      resetCafeteriaForm();
      toast.success('Cafeteria updated successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update cafeteria');
    }
  });

  const deleteCafeteriaMutation = useMutation({
    mutationFn: orgAdminService.deleteCafeteria,
    onSuccess: () => {
      queryClient.invalidateQueries(['cafeterias', selectedOfficeId]);
      toast.success('Cafeteria deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete cafeteria');
    }
  });

  const handleOfficeSubmit = (e) => {
    e.preventDefault();
    const data = {
      locationId: parseInt(locationId),
      ...officeFormData
    };

    if (editingOffice) {
      updateOfficeMutation.mutate({ id: editingOffice.id, data });
    } else {
      createOfficeMutation.mutate(data);
    }
  };

  const handleCafeteriaSubmit = (e) => {
    e.preventDefault();
    const data = {
      officeId: parseInt(selectedOfficeId),
      name: cafeteriaFormData.name,
      floorNumber: parseInt(cafeteriaFormData.floorNumber)
    };

    if (editingCafeteria) {
      updateCafeteriaMutation.mutate({ id: editingCafeteria.id, data });
    } else {
      createCafeteriaMutation.mutate(data);
    }
  };

  const handleEditOffice = (office) => {
    setEditingOffice(office);
    setOfficeFormData({
      officeName: office.officeName || '',
      address: office.address || ''
    });
    setShowOfficeModal(true);
  };

  const handleEditCafeteria = (cafeteria) => {
    setEditingCafeteria(cafeteria);
    setCafeteriaFormData({
      name: cafeteria.name,
      floorNumber: cafeteria.floorNumber?.toString() || ''
    });
    setShowCafeteriaModal(true);
  };

  const handleAddCafeteria = (officeId) => {
    setSelectedOfficeId(officeId);
    setShowCafeteriaModal(true);
  };

  const resetOfficeForm = () => {
    setOfficeFormData({ officeName: '', address: '' });
    setEditingOffice(null);
  };

  const resetCafeteriaForm = () => {
    setCafeteriaFormData({ name: '', floorNumber: '' });
    setEditingCafeteria(null);
  };

  if (officesLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="font-bold animate-pulse">Loading Location Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/org-admin/locations')}
          className="!p-3"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Location Details</h1>
          <p className="text-gray-500 font-medium mt-2">
            Manage offices and cafeterias for this location
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowOfficeModal(true)}>
          <Plus className="mr-2" size={20} /> Add Office
        </Button>
      </div>

      {}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="text-purple-500" size={28} />
          <h2 className="text-2xl font-bold text-gray-900">Offices</h2>
        </div>

        {offices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
            <Building2 className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Offices Yet</h3>
            <p className="text-gray-400 mb-6">
              Add your first office building to start creating cafeterias.
            </p>
            <Button variant="primary" onClick={() => setShowOfficeModal(true)}>
              <Plus className="mr-2" size={20} /> Create First Office
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {offices.map((office) => (
              <OfficeCard
                key={office.id}
                office={office}
                onEdit={handleEditOffice}
                onDelete={() => {
                  if (window.confirm('Delete this office and all its cafeterias?')) {
                    deleteOfficeMutation.mutate(office.id);
                  }
                }}
                onAddCafeteria={() => handleAddCafeteria(office.id)}
                onViewCafeterias={() => setSelectedOfficeId(office.id)}
                cafeterias={selectedOfficeId === office.id ? cafeterias : []}
                isLoadingCafeterias={selectedOfficeId === office.id && cafeteriasLoading}
                onEditCafeteria={handleEditCafeteria}
                onDeleteCafeteria={(cafeteriaId) => {
                  if (window.confirm('Delete this cafeteria?')) {
                    deleteCafeteriaMutation.mutate(cafeteriaId);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {}
      <Modal
        isOpen={showOfficeModal}
        onClose={() => {
          setShowOfficeModal(false);
          resetOfficeForm();
        }}
        title={editingOffice ? 'Edit Office' : 'Create New Office'}
      >
        <form onSubmit={handleOfficeSubmit} className="space-y-5">
          <Input
            label="Office Name"
            name="officeName"
            value={officeFormData.officeName}
            onChange={(e) => setOfficeFormData({ ...officeFormData, officeName: e.target.value })}
            placeholder="e.g., Building A"
            required
          />
          <Input
            label="Address"
            name="address"
            value={officeFormData.address}
            onChange={(e) => setOfficeFormData({ ...officeFormData, address: e.target.value })}
            placeholder="e.g., 123 Tech Street, Whitefield"
            required
          />

          {}
          <div className="flex gap-3 pt-6 border-t border-gray-100 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 pb-6 bg-gray-50 sticky bottom-0">
            <Button type="submit" variant="primary" className="flex-1">
              {editingOffice ? 'Update Office' : 'Create Office'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowOfficeModal(false);
                resetOfficeForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {}
      <Modal
        isOpen={showCafeteriaModal}
        onClose={() => {
          setShowCafeteriaModal(false);
          resetCafeteriaForm();
        }}
        title={editingCafeteria ? 'Edit Cafeteria' : 'Create New Cafeteria'}
      >
        <form onSubmit={handleCafeteriaSubmit} className="space-y-5">
          <Input
            label="Cafeteria Name"
            name="name"
            value={cafeteriaFormData.name}
            onChange={(e) => setCafeteriaFormData({ ...cafeteriaFormData, name: e.target.value })}
            placeholder="e.g., Main Food Court"
            required
          />
          <Input
            label="Floor Number"
            type="number"
            name="floorNumber"
            value={cafeteriaFormData.floorNumber}
            onChange={(e) => setCafeteriaFormData({ ...cafeteriaFormData, floorNumber: e.target.value })}
            placeholder="e.g., 2"
            required
          />

          {}
          <div className="flex gap-3 pt-6 border-t border-gray-100 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 pb-6 bg-gray-50 sticky bottom-0">
            <Button type="submit" variant="primary" className="flex-1">
              {editingCafeteria ? 'Update Cafeteria' : 'Create Cafeteria'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCafeteriaModal(false);
                resetCafeteriaForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const OfficeCard = ({
  office,
  onEdit,
  onDelete,
  onAddCafeteria,
  onViewCafeterias,
  cafeterias,
  isLoadingCafeterias,
  onEditCafeteria,
  onDeleteCafeteria
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{office.officeName}</h3>
                <p className="text-sm text-gray-500">{office.address}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(office)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded) onViewCafeterias();
            }}
          >
            <UtensilsCrossed size={16} className="mr-2" />
            {isExpanded ? 'Hide' : 'View'} Cafeterias ({office.cafeteriaCount || 0})
          </Button>
          <Button variant="primary" size="sm" onClick={onAddCafeteria}>
            <Plus size={16} className="mr-2" /> Add Cafeteria
          </Button>
        </div>

        {}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            {isLoadingCafeterias ? (
              <div className="text-center py-8 text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-sm">Loading cafeterias...</p>
              </div>
            ) : cafeterias.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <UtensilsCrossed className="mx-auto mb-2" size={32} />
                <p className="text-sm">No cafeterias in this office yet</p>
              </div>
            ) : (
              cafeterias.map((cafeteria) => (
                <div
                  key={cafeteria.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 border border-orange-100"
                >
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed size={20} className="text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-900">{cafeteria.name}</p>
                      <p className="text-sm text-gray-500">
                        Floor {cafeteria.floorNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditCafeteria(cafeteria)}
                      className="p-2 hover:bg-orange-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteCafeteria(cafeteria.id)}
                      className="p-2 hover:bg-red-100 rounded-xl transition-colors text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
