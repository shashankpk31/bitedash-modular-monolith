import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import toast from 'react-hot-toast';

/**
 * Organization Registration
 * Based on: organization_registration stitch design
 * NEW screen - No existing equivalent
 */

const OrganizationRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    orgName: '',
    industry: '',
    size: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    address: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      toast.success('Organization registered successfully!');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background-light p-4">
      <header className="max-w-2xl mx-auto mb-8">
        <button onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}>
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-3xl font-bold mt-4 mb-2">Register Your Organization</h1>
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
            <h2 className="font-bold text-xl mb-4">Organization Details</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Organization Name</label>
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                placeholder="TechCorp Inc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select industry</option>
                <option value="tech">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Company Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select size</option>
                <option value="1-50">1-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                rows="3"
                placeholder="Head office address"
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Admin Account</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Admin Full Name</label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Admin Email</label>
              <input
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Admin Phone</label>
              <input
                type="tel"
                value={formData.adminPhone}
                onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Security & Review</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Admin Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="p-6 bg-slate-50 rounded-xl space-y-2">
              <h3 className="font-bold">Summary</h3>
              <p className="text-sm"><strong>Organization:</strong> {formData.orgName}</p>
              <p className="text-sm"><strong>Admin:</strong> {formData.adminName}</p>
              <p className="text-sm"><strong>Email:</strong> {formData.adminEmail}</p>
            </div>
            <div className="flex items-start gap-2 p-4 bg-primary/5 rounded-xl">
              <Icon name="check_circle" className="text-primary mt-0.5" />
              <p className="text-sm text-slate-600">
                By registering, you agree to our terms of service and privacy policy.
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
            {step === 3 ? 'Complete Registration' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationRegistration;
