import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building2, Home, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';

const LocationSelector = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedCafeteria, setSelectedCafeteria] = useState(null);

  // Fetch organizations
  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organization/public');
      return response.data.data || [];
    },
    retry: 1,
  });

  // Fetch offices for selected organization
  const { data: offices, isLoading: loadingOffices } = useQuery({
    queryKey: ['offices', selectedOrg?.id],
    queryFn: async () => {
      const response = await api.get(`/organisation/offices/organization/${selectedOrg.id}`);
      return response.data.data || [];
    },
    enabled: !!selectedOrg && step === 2,
    retry: 1,
  });

  // Fetch cafeterias for selected office
  const { data: cafeterias, isLoading: loadingCafeterias } = useQuery({
    queryKey: ['cafeterias', selectedOffice?.id],
    queryFn: async () => {
      const response = await api.get(`/organisation/cafeterias/office/${selectedOffice.id}`);
      return response.data.data || [];
    },
    enabled: !!selectedOffice && step === 3,
    retry: 1,
  });

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setStep(2);
  };

  const handleOfficeSelect = (office) => {
    setSelectedOffice(office);
    setStep(3);
  };

  const handleCafeteriaSelect = (cafeteria) => {
    setSelectedCafeteria(cafeteria);

    // Call onComplete with all selected data
    onComplete({
      organizationId: selectedOrg.id,
      organizationName: selectedOrg.name,
      officeId: selectedOffice.id,
      officeName: selectedOffice.name,
      cafeteriaId: cafeteria.id,
      cafeteriaName: cafeteria.name,
    });
  };

  const handleBack = () => {
    if (step === 2) {
      setSelectedOrg(null);
      setStep(1);
    } else if (step === 3) {
      setSelectedOffice(null);
      setStep(2);
    }
  };

  // Render loading state
  const renderLoading = (message) => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
      <p className="text-gray-600">{message}</p>
    </div>
  );

  // Render empty state
  const renderEmpty = (message) => (
    <div className="text-center py-12">
      <MapPin className="text-gray-400 mx-auto mb-4" size={48} />
      <p className="text-gray-600">{message}</p>
    </div>
  );

  // Render organization selection
  const renderOrganizations = () => {
    if (loadingOrgs) return renderLoading('Loading organizations...');
    if (!organizations || organizations.length === 0)
      return renderEmpty('No organizations available');

    return (
      <div className="space-y-3">
        {organizations.map((org) => (
          <button
            key={org.id}
            onClick={() => handleOrgSelect(org)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-brand-primary hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                    {org.name}
                  </h3>
                  {org.address && (
                    <p className="text-sm text-gray-600">{org.address}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-brand-primary transition-colors" size={20} />
            </div>
          </button>
        ))}
      </div>
    );
  };

  // Render office selection
  const renderOffices = () => {
    if (loadingOffices) return renderLoading('Loading offices...');
    if (!offices || offices.length === 0)
      return renderEmpty('No offices available for this organization');

    return (
      <div className="space-y-3">
        {offices.map((office) => (
          <button
            key={office.id}
            onClick={() => handleOfficeSelect(office)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-brand-primary hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Home className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                    {office.name}
                  </h3>
                  {office.address && (
                    <p className="text-sm text-gray-600">{office.address}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-brand-primary transition-colors" size={20} />
            </div>
          </button>
        ))}
      </div>
    );
  };

  // Render cafeteria selection
  const renderCafeterias = () => {
    if (loadingCafeterias) return renderLoading('Loading cafeterias...');
    if (!cafeterias || cafeterias.length === 0)
      return renderEmpty('No cafeterias available at this office');

    return (
      <div className="space-y-3">
        {cafeterias.map((cafeteria) => (
          <button
            key={cafeteria.id}
            onClick={() => handleCafeteriaSelect(cafeteria)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-brand-primary hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                    {cafeteria.name}
                  </h3>
                  {cafeteria.openingTime && cafeteria.closingTime && (
                    <p className="text-sm text-gray-600">
                      {cafeteria.openingTime} - {cafeteria.closingTime}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-brand-primary transition-colors" size={20} />
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= num
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {num}
            </div>
            {num < 3 && (
              <div
                className={`w-12 h-1 mx-2 transition-colors ${
                  step > num ? 'bg-brand-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 1 && 'Select Your Organization'}
          {step === 2 && 'Select Your Office'}
          {step === 3 && 'Select Your Cafeteria'}
        </h2>
        <p className="text-gray-600">
          {step === 1 && 'Choose your company to get started'}
          {step === 2 && 'Where do you work?'}
          {step === 3 && 'Where would you like to order from?'}
        </p>
      </div>

      {/* Back Button */}
      {step > 1 && (
        <button
          onClick={handleBack}
          className="mb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center"
        >
          ← Back
        </button>
      )}

      {/* Content */}
      <div>
        {step === 1 && renderOrganizations()}
        {step === 2 && renderOffices()}
        {step === 3 && renderCafeterias()}
      </div>
    </div>
  );
};

export default LocationSelector;
