import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../../services/authService';
import Icon from '../../../components/ui/Icon';
import toast from 'react-hot-toast';

/**
 * Mobile-First Registration with Invite Code
 * Based on: employee_signup_invite stitch design
 * REPLACEMENT for: RegisterForm.jsx (for employees)
 * BETTER: Mobile-optimized, invite code integration, better UX
 */

const RegisterMobile = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Verification
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        username: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: 'EMPLOYEE',
        inviteCode: formData.inviteCode,
      });

      toast.success('Registration successful! Please verify your account.');
      setStep(2); // Move to verification step
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <button onClick={() => step === 1 ? navigate('/') : setStep(1)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100">
          <Icon name="arrow_back" />
        </button>
        <span className="text-sm text-slate-500">Step {step}/2</span>
      </header>

      <div className="flex-1 px-6 pb-20">
        <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="max-w-md mx-auto">
          {step === 1 ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Join BiteDash</h2>
                <p className="text-slate-500">Create your employee account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary"
                    placeholder="john@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary"
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Invite Code</label>
                  <input
                    type="text"
                    value={formData.inviteCode}
                    onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary font-mono"
                    placeholder="ORG-ABC-123"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Get this from your organization admin</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <button onClick={() => navigate('/login')} className="text-primary font-bold">
                    Sign In
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-primary/10 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="mark_email_read" size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
              <p className="text-slate-500 mb-8">We sent a verification code to {formData.email}</p>
              <button
                onClick={() => navigate('/verify')}
                className="bg-primary text-white px-8 py-3 rounded-xl font-semibold"
              >
                Enter Verification Code
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterMobile;
