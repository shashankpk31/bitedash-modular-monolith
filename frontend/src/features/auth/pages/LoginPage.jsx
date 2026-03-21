import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, ArrowLeft, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import { useLogin } from '../../../services/queries/auth.queries';
import { isValidEmail, isValidPhone } from '../../../common/utils';

// Login page - mobile-first, responsive design
const LoginPage = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    userIdentifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [identifierType, setIdentifierType] = useState('email'); // 'email' or 'phone'

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.userIdentifier.trim()) {
      newErrors.userIdentifier = 'Email or phone is required';
    } else if (identifierType === 'email' && !isValidEmail(formData.userIdentifier)) {
      newErrors.userIdentifier = 'Invalid email address';
    } else if (identifierType === 'phone' && !isValidPhone(formData.userIdentifier)) {
      newErrors.userIdentifier = 'Invalid phone number (10 digits, starts with 6-9)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle identifier change and detect type
  // Why? Auto-detect if user is entering email or phone
  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, userIdentifier: value });

    // Auto-detect type based on input
    if (value.includes('@')) {
      setIdentifierType('email');
    } else if (/^\d+$/.test(value)) {
      setIdentifierType('phone');
    }

    // Clear error when user starts typing
    if (errors.userIdentifier) {
      setErrors({ ...errors, identifier: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setFormData({ ...formData, password: e.target.value });
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    console.log(formData);
    

    // Call login mutation
    loginMutation.mutate({
      userIdentifier: formData.userIdentifier,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dim p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/logo.svg"
              alt="BiteDash Logo"
              className="w-12 h-12"
            />
            <h1 className="font-headline text-headline-lg text-white">BiteDash</h1>
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="font-headline text-display-sm text-white">
              Welcome Back!
            </h2>
            <p className="text-body-lg text-white/80">
              Login to access your corporate dining dashboard and enjoy delicious meals
              from your workplace cafeteria.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-white/60 text-label-sm">
            Trusted by organizations for seamless corporate dining
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Back button (mobile) */}
          <button
            onClick={() => navigate('/')}
            className="lg:hidden flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-label-md">Back to home</span>
          </button>

          {/* Logo (mobile) */}
          <div className="lg:hidden flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="BiteDash Logo"
              className="w-10 h-10"
            />
            <h1 className="font-headline text-headline-md text-on-surface">BiteDash</h1>
          </div>

          {/* Form header */}
          <div className="space-y-2">
            <h2 className="font-headline text-display-sm text-on-surface">
              Login to Your Account
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifier (Email or Phone) */}
            <Input
              label="Email or Phone"
              type="text"
              placeholder={identifierType === 'email' ? 'your.email@company.com' : '9876543210'}
              value={formData.userIdentifier}
              onChange={handleIdentifierChange}
              error={errors.userIdentifier}
              icon={identifierType === 'email' ? <Mail size={18} /> : <Phone size={18} />}
              iconPosition="left"
              required
              disabled={loginMutation.isPending}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handlePasswordChange}
              error={errors.password}
              icon={<Lock size={18} />}
              iconPosition="left"
              required
              disabled={loginMutation.isPending}
            />

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-label-md text-primary hover:text-primary-dim transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/15" />
            </div>
            <div className="relative flex justify-center text-label-sm">
              <span className="px-4 bg-surface text-on-surface-variant">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register link */}
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate('/register')}
          >
            Create New Account
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
