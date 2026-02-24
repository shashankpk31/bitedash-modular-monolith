import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { authService } from "../services/authService";
import Input from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import toast from "react-hot-toast"; 
import { ERR, MSG } from "../../../config/errMsgConstants";
import { ROLES } from "../../../config/constants";

const LoginForm = ({ onSwitchToRegister, onBack, onUnverified }) => {
  const { saveLoginDetails } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userIdentifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
            
      const { user, token } = response;

      saveLoginDetails(user, token);
      toast.success(MSG.LOGIN_SUCCESS);

      // Redirect based on user role
      switch (user.role) {
        case ROLES.SUPER_ADMIN:
          navigate("/admin/dashboard");
          break;
        case ROLES.ORG_ADMIN:
          navigate("/org-admin/dashboard");
          break;
        case ROLES.VENDOR:
          navigate("/vendor/dashboard");
          break;
        case ROLES.EMPLOYEE:
          navigate("/employee/home");
          break;
        default:
          navigate("/");
      }

    } catch (err) {
      console.log(err);

      // Check if error message contains "not verified" (case-insensitive)
      const errorMessage = typeof err === 'string' ? err : String(err);
      const isNotVerified = errorMessage.toLowerCase().includes('not verified');

      if (isNotVerified || err === ERR.ACC_NOT_VERIFIED) {
        toast.error("Account not verified yet. Redirecting...");
        onUnverified(formData.userIdentifier);
      } else {
        const finalError = err || ERR.INVALID_CREDENTIALS;
        setError(finalError);
        toast.error(finalError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-brand-primary mb-6 group transition-colors"
      >
        <ArrowLeft
          size={18}
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <div className="mb-8 flex flex-col items-center">
        <img src="/logo.svg" alt="BiteDash" className="h-20 w-20 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 mt-2 text-center">
          Enter your details to access your BiteDash account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Business Email or Phone Number"
          name="userIdentifier"
          type="text"
          placeholder="name@company.com or 7867546787"
          value={formData.userIdentifier}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-semibold text-brand-primary hover:text-brand-secondary"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" variant="primary" className="w-full h-14" disabled={loading}>
          {loading ? "Authenticating..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-brand-primary font-bold hover:underline"
          >
            Create one for free
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;