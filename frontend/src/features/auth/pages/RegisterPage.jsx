import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, User, Building2, ArrowLeft, Utensils, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import Select from '../../../common/components/Select';
import { useRegister } from '../../../services/queries/auth.queries';
import { useOrganizations } from '../../../services/queries/organization.queries';
import { isValidEmail, isValidPhone, validatePassword } from '../../../common/utils';
import { ROLES } from '../../../config/constants';

// Register page with role selection
const RegisterPage = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [selectedRole, setSelectedRole] = useState('');
  const [contactType, setContactType] = useState('email'); // 'email' or 'phone'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    organizationName: '',
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Fetch organizations for dropdown
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  // Available roles for registration (removed ORG_ADMIN - only super admin can create orgs)
  const roles = [
    {
      value: 'ROLE_EMPLOYEE',
      label: 'Employee',
      description: 'Order food from your workplace cafeteria',
      icon: User,
      needsOrg: true,
    },
    {
      value: 'ROLE_VENDOR',
      label: 'Vendor',
      description: 'Manage your stall and receive orders',
      icon: Utensils,
      needsOrg: true,
    },
  ];

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!selectedRole) {
      newErrors.role = 'Please select a role';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (contactType === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!isValidPhone(formData.phone)) {
        newErrors.phone = 'Invalid phone number (10 digits, starts with 6-9)';
      }
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    const selectedRoleData = roles.find(r => r.value === selectedRole);
    if (selectedRoleData?.needsOrg && !formData.organizationId) {
      newErrors.organizationId = 'Please select your organization';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });

    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }

    // Check password strength
    if (field === 'password') {
      const validation = validatePassword(e.target.value);
      setPasswordStrength(validation);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Prepare registration data - MUST match RegisterRequest.java
    const registrationData = {
      fullName: formData.name,  // Backend expects fullName, not name
      role: selectedRole,
      password: formData.password,
    };

    // Add contact method
    if (contactType === 'email') {
      registrationData.email = formData.email;
    } else {
      registrationData.phoneNumber = formData.phone;  // Backend expects phoneNumber, not phone
    }

    // Add organization ID (required for all user registrations)
    if (formData.organizationId) {
      registrationData.organizationId = parseInt(formData.organizationId);
    }

    registerMutation.mutate(registrationData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-6 lg:space-y-8"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2 rounded-lg hover:bg-surface-container"
        >
          <ArrowLeft size={20} />
          <span className="text-label-md font-semibold">Back to home</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-card">
            <img
              src="/logo.svg"
              alt="BiteDash Logo"
              className="w-12 h-12"
            />
          </div>
          <h1 className="font-headline text-headline-md lg:text-headline-lg text-on-surface">BiteDash</h1>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-ambient-lg">
          {/* Header */}
          <div className="space-y-3 mb-8 lg:mb-10">
            <h2 className="font-headline text-display-sm lg:text-display-md text-on-surface">
              Create Your Account
            </h2>
            <p className="text-body-md lg:text-body-lg text-on-surface-variant">
              Choose your role and get started with BiteDash
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-label-lg text-on-surface font-semibold">
                I am a <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.value);
                        setErrors({ ...errors, role: '' });
                      }}
                      className={`p-5 lg:p-6 rounded-xl border-2 transition-all text-left hover:shadow-card active:scale-[0.98] ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary/10 shadow-ambient'
                          : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedRole === role.value ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          <Icon size={24} />
                        </div>
                        <div className="font-headline text-headline-sm text-on-surface">
                          {role.label}
                        </div>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.role && (
                <div className="flex items-center gap-2 text-error bg-error/10 px-4 py-3 rounded-lg">
                  <AlertCircle size={16} />
                  <p className="text-label-md font-semibold">{errors.role}</p>
                </div>
              )}
            </div>

            {/* Personal Information */}
            {selectedRole && (
              <>
                <div className="pt-6 border-t border-outline-variant/30">
                  <h3 className="font-headline text-headline-md text-on-surface mb-6">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Name - Full width */}
                    <div className="lg:col-span-2">
                      <Input
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange('name')}
                        error={errors.name}
                        icon={<User size={18} />}
                        required
                        disabled={registerMutation.isPending}
                      />
                    </div>

                    {/* Contact Method Toggle - Full width */}
                    <div className="space-y-3 lg:col-span-2">
                      <label className="block text-label-lg text-on-surface font-semibold">
                        Contact Method <span className="text-error">*</span>
                      </label>
                      <div className="inline-flex p-1 bg-surface-container rounded-xl w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setContactType('email')}
                          className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-lg text-label-md font-semibold transition-all flex items-center justify-center gap-2 ${
                            contactType === 'email'
                              ? 'bg-primary text-on-primary shadow-ambient'
                              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <Mail size={16} />
                          Email
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactType('phone')}
                          className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-lg text-label-md font-semibold transition-all flex items-center justify-center gap-2 ${
                            contactType === 'phone'
                              ? 'bg-primary text-on-primary shadow-ambient'
                              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <Phone size={16} />
                          Phone
                        </button>
                      </div>
                    </div>

                    {/* Email or Phone - Full width */}
                    <div className="lg:col-span-2">
                      {contactType === 'email' ? (
                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="your.email@company.com"
                          value={formData.email}
                          onChange={handleChange('email')}
                          error={errors.email}
                          helperText="We'll send a verification code to this email"
                          icon={<Mail size={18} />}
                          required
                          disabled={registerMutation.isPending}
                        />
                      ) : (
                        <Input
                          label="Phone Number"
                          type="tel"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={handleChange('phone')}
                          error={errors.phone}
                          helperText="We'll send a verification code to this number"
                          icon={<Phone size={18} />}
                          required
                          disabled={registerMutation.isPending}
                        />
                      )}
                    </div>

                    {/* Password */}
                    <div className="lg:col-span-1">
                      <Input
                        label="Password"
                        type="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange('password')}
                        error={errors.password}
                        icon={<Lock size={18} />}
                        required
                        disabled={registerMutation.isPending}
                      />
                      {/* Password strength indicator */}
                      {passwordStrength && formData.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                  passwordStrength.strength >= level
                                    ? level <= 2
                                      ? 'bg-error'
                                      : level === 3
                                      ? 'bg-warning'
                                      : 'bg-success'
                                    : 'bg-surface-container'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-label-sm text-on-surface-variant">
                            {passwordStrength.strength <= 2 ? 'Weak' : passwordStrength.strength === 3 ? 'Good' : 'Strong'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="lg:col-span-1">
                      <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        error={errors.confirmPassword}
                        icon={<Lock size={18} />}
                        required
                        disabled={registerMutation.isPending}
                      />
                    </div>
                  </div>
                </div>

                {/* Organization Selection */}
                {selectedRole && (
                  <div className="pt-6 border-t border-outline-variant/30 lg:col-span-2">
                    <h3 className="font-headline text-headline-md lg:text-headline-lg text-on-surface mb-6">
                      Organization Details
                    </h3>
                    <Select
                      label="Select Your Organization"
                      placeholder={orgsLoading ? 'Loading organizations...' : 'Choose your organization'}
                      options={
                        organizations?.map((org) => ({
                          value: org.id,
                          label: org.name,
                        })) || []
                      }
                      value={formData.organizationId}
                      onChange={(value) => {
                        setFormData({ ...formData, organizationId: value });
                        if (errors.organizationId) {
                          setErrors({ ...errors, organizationId: '' });
                        }
                      }}
                      icon={Building2}
                      error={errors.organizationId}
                      helperText="Select the organization you belong to"
                      searchable
                      required
                      disabled={registerMutation.isPending || orgsLoading}
                    />
                  </div>
                )}

                {/* Submit - Full width */}
                <div className="lg:col-span-2 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={registerMutation.isPending}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Login link */}
          <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
            <p className="text-body-md lg:text-body-lg text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dim font-bold transition-colors inline-flex items-center gap-1">
                Login here
                <ArrowRight size={16} />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
