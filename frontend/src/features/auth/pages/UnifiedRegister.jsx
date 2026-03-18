import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import authService from '../../../services/authService';
import { organizationService } from '../../../services/organizationService';
import Icon from '../../../components/ui/Icon';
import toast from 'react-hot-toast';

const UnifiedRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'employee';

  const [userType, setUserType] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    officeId: '',
    // Employee specific
    employeeId: '',
    // Vendor specific
    shopName: '',
    gstNumber: '',
  });

  // Fetch organizations
  const { data: organizations = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getAllOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleToggle = (type) => {
    setUserType(type);
    // Keep common fields, reset role-specific fields
    setFormData(prev => ({
      fullName: prev.fullName,
      email: prev.email,
      phoneNumber: prev.phoneNumber,
      password: prev.password,
      confirmPassword: prev.confirmPassword,
      organizationId: prev.organizationId,
      officeId: '',
      employeeId: '',
      shopName: '',
      gstNumber: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.organizationId) {
      toast.error('Please select an organization');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
        password: formData.password,
        role: userType === 'employee' ? 'ROLE_EMPLOYEE' : 'ROLE_VENDOR',
        organizationId: parseInt(formData.organizationId),
        officeId: formData.officeId ? parseInt(formData.officeId) : null,
      };

      // Add role-specific fields
      if (userType === 'employee') {
        payload.employeeId = formData.employeeId || null;
      } else {
        payload.shopName = formData.shopName || null;
        payload.gstNumber = formData.gstNumber || null;
      }

      await authService.register(payload);

      toast.success('Registration successful! Please verify your account.');
      navigate('/verify', { state: { email: formData.email || formData.phoneNumber } });
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Icon name="arrow_back" size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Icon name="restaurant" size={24} className="text-primary" />
          <span className="font-bold text-lg">BiteDash</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Toggle Switch */}
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg inline-flex w-full">
            <button
              onClick={() => handleToggle('employee')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all relative ${
                userType === 'employee'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon name="person" size={18} />
                <span>Employee</span>
              </div>
            </button>
            <button
              onClick={() => handleToggle('vendor')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all relative ${
                userType === 'vendor'
                  ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon name="store" size={18} />
                <span>Vendor</span>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={userType}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {userType === 'employee' ? 'Join as Employee' : 'Register Your Business'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {userType === 'employee'
                    ? 'Create your account to order delicious food at work'
                    : 'Partner with us to serve thousands of hungry employees'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={userType === 'employee' ? 'John Doe' : 'Vendor Owner Name'}
                    required
                  />
                </div>

                {/* Organization Dropdown */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Icon name="business" size={16} />
                    Organization
                  </label>
                  <select
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select your organization</option>
                    {loadingOrgs ? (
                      <option disabled>Loading organizations...</option>
                    ) : (
                      organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="9876543210"
                    />
                    <p className="text-xs text-slate-500 mt-1">10-digit Indian mobile number</p>
                  </div>
                </div>

                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Icon name="info" size={14} />
                  At least one contact method (email or phone) is required
                </p>

                {/* Employee Specific Fields */}
                {userType === 'employee' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Icon name="badge" size={16} />
                      Employee ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="EMP-12345"
                    />
                    <p className="text-xs text-slate-500 mt-1">Your company employee identifier</p>
                  </div>
                )}

                {/* Vendor Specific Fields */}
                {userType === 'vendor' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <Icon name="store" size={16} />
                        Business/Stall Name
                      </label>
                      <input
                        type="text"
                        name="vendorName"
                        value={formData.vendorName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Joe's Pizza Corner"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Registered Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Joe's Food Services Pvt Ltd"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Cuisine Type</label>
                        <select
                          name="cuisineType"
                          value={formData.cuisineType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select cuisine</option>
                          <option value="Indian">Indian</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Continental">Continental</option>
                          <option value="Italian">Italian</option>
                          <option value="Mexican">Mexican</option>
                          <option value="Fast Food">Fast Food</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Multi-Cuisine">Multi-Cuisine</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">GST Number (Optional)</label>
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                    userType === 'employee'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="check" size={20} />
                      <span>Create Account</span>
                    </div>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-primary font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnifiedRegister;
