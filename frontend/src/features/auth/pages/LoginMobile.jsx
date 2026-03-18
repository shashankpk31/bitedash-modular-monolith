import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import authService from '../../../services/authService';
import Icon from '../../../components/ui/Icon';
import toast from 'react-hot-toast';
import { ROLES } from '../../../config/constants';

/**
 * Mobile-First Login Screen
 * Based on: login_onboarding_mobile stitch design
 * REPLACEMENT for: LoginForm.jsx
 * KEEPS: Same API integration (authService.login)
 * BETTER: Mobile-optimized UI, touch-friendly, animations
 */

const LoginMobile = () => {
  const navigate = useNavigate();
  const { saveLoginDetails } = useAuth();
  const [formData, setFormData] = useState({ userIdentifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      const response = await authService.login(formData);
      const { user, token } = response;

      saveLoginDetails(user, token);
      toast.success('Welcome back!');

      // Same role-based routing as original
      const routes = {
        [ROLES.SUPER_ADMIN]: '/admin/dashboard',
        [ROLES.ORG_ADMIN]: '/org-admin/dashboard',
        [ROLES.VENDOR]: '/vendor/dashboard',
        [ROLES.EMPLOYEE]: '/employee/menu',
      };
      navigate(routes[user.role] || '/');

    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button onClick={() => navigate('/')} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <Icon name="arrow_back" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-primary p-3 rounded-xl">
              <Icon name="restaurant_menu" size={32} className="text-white" fill={1} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">BiteDash</h1>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to continue your food journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email or Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="person" className="text-slate-400" size={20} />
                </div>
                <input
                  type="text"
                  name="userIdentifier"
                  value={formData.userIdentifier}
                  onChange={(e) => setFormData({ ...formData, userIdentifier: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter email or phone number"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="lock" className="text-slate-400" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-slate-400" size={20} />
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button type="button" className="text-sm text-primary font-semibold">
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-sm text-slate-500">OR</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} className="text-primary font-bold">
                Sign Up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginMobile;
