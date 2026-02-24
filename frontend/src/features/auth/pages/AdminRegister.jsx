import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import {register} from '../../auth/services/authService'

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    adminSecretCode: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { 
      ...formData, 
      role: 'ADMIN' 
    };
    
    console.log("Registering Admin:", payload);
    register(payload)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100"
      >
        {}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-2">Create a high-level administrative account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="System Administrator"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <Input
            label="Admin Email"
            name="email"
            type="email"
            placeholder="admin@hungerbox.com"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Phone Number (Optional)"
            name="phoneNumber"
            placeholder="9876543210"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 italic ml-1 mb-2">
            * At least one contact method (email or phone) is required
          </p>
          <Input
            label="Security Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            label="Admin Secret Code"
            name="adminSecretCode"
            type="password"
            placeholder="Enter authorization code"
            value={formData.adminSecretCode}
            onChange={handleChange}
            required
          />

          <div className="pt-4">
            <Button type="submit">
              Complete Setup
            </Button>
          </div>
        </form>

        <button 
          onClick={() => navigate('/')}
          className="mt-8 flex items-center justify-center w-full text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Main Website
        </button>
      </motion.div>
    </div>
  );
};

export default AdminRegister;