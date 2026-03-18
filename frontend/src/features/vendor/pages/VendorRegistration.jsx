import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import toast from 'react-hot-toast';

/**
 * Vendor Registration - Multi-step Form
 * Based on: vendor_registration stitch design
 * NEW screen - No existing equivalent
 */

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: '',
    location: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      toast.success('Registration submitted! Awaiting approval.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background-light p-4">
      <header className="max-w-2xl mx-auto mb-8">
        <button onClick={() => step === 1 ? navigate('/') : setStep(step - 1)} className="mb-4">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-3xl font-bold mb-2">Vendor Registration</h1>
        <p className="text-slate-500">Step {step} of 3</p>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-slate-200'}`} />
          ))}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Business Information</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                placeholder="e.g., Joe's Coffee Shop"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Business Type</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select type</option>
                <option value="cafe">Café/Coffee Shop</option>
                <option value="restaurant">Restaurant</option>
                <option value="food-truck">Food Truck</option>
                <option value="bakery">Bakery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location/Campus</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                placeholder="Main Campus - Building A"
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Contact Information</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Account Security</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="p-4 bg-primary/5 rounded-xl">
              <p className="text-sm text-slate-600">
                <Icon name="info" size={16} className="inline text-primary" /> Your registration will be reviewed by the organization admin. You'll receive an email once approved.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-3 border rounded-xl font-semibold">
              Back
            </button>
          )}
          <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">
            {step === 3 ? 'Submit Registration' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorRegistration;
