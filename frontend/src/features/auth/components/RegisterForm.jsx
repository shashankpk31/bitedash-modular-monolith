import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/ui/Input";
import {Button} from "../../../components/ui/Button";
import AuthToggle from "../../../components/ui/Toggle/AuthToggle";
import EmployeeFields from "./forms/EmployeeFields";
import VendorFields from "./forms/VendorFields";
import {authService} from "../services/authService";
import { organizationService } from "../../../services/organizationService";

const RegisterForm = ({ onSwitchToLogin, onBack }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState("ROLE_EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [suggestedOrg, setSuggestedOrg] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    organizationId: ""
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        
        const response = await organizationService.getAllOrganizations();
        if (response && response.length>0) {
          setOrganizations(response);
        }
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
      }
    };
    fetchOrganizations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email" && value.includes("@")) {
      const domain = value.substring(value.indexOf("@") + 1).toLowerCase();

      const matchingOrg = organizations.find(
        org => org.domain && org.domain.toLowerCase() === domain
      );

      if (matchingOrg) {
        setSuggestedOrg(matchingOrg);
        setFormData(prev => ({ ...prev, organizationId: matchingOrg.id }));
      } else {
        setSuggestedOrg(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.email && !formData.phoneNumber) {
      setError("Either email or phone number must be provided");
      setLoading(false);
      return;
    }

    const payload = { ...formData, role };

    try {
      await authService.register(payload);
      const identifier = formData.email || formData.phoneNumber;
      navigate("/verify", { state: { identifier: identifier } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <AuthToggle activeRole={role} setRole={setRole} />
      </div>

      <div className="mb-6 flex flex-col items-center">
        <img src="/logo.svg" alt="BiteDash" className="h-16 w-16 mb-3" />
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-1 text-center">Join BiteDash as a {role === "ROLE_EMPLOYEE" ? "Employee" : "Vendor"}.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Full Name"
          name="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />

        <div className="space-y-2">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={handleInputChange}
          />
          <p className="text-xs text-gray-500 text-center font-semibold">OR</p>
          <Input
            label="Phone Number"
            name="phoneNumber"
            placeholder="9876543210"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
          <p className="text-xs text-gray-500 italic ml-1">
            * At least one contact method (email or phone) is required
          </p>
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {role === "ROLE_EMPLOYEE" ? (
              <EmployeeFields
                onDataChange={handleInputChange}
                organizations={organizations}
                selectedOrgId={formData.organizationId}
                suggestedOrg={suggestedOrg}
              />
            ) : (
              <VendorFields
                onDataChange={handleInputChange}
                organizations={organizations}
                selectedOrgId={formData.organizationId}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            {loading ? "Creating Account..." : "Register Now"}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="text-orange-600 font-bold hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;