import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, RefreshCcw, ArrowLeft } from "lucide-react";
import { authService } from "../services/authService";
import { Button } from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import toast from "react-hot-toast";

const AccountVerifyForm = ({ identifier, onSuccess, onBack }) => {
  const [verifyType, setVerifyType] = useState(identifier?.includes("@") ? "EMAIL" : "SMS");
  const [currentIdentifier, setCurrentIdentifier] = useState(identifier || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyAccount(currentIdentifier, otp);
      toast.success("Account verified! You can now login.");
      onSuccess(); 
    } catch (err) {
      toast.error(err || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp(currentIdentifier, verifyType);
      toast.success(`Verification code sent to ${currentIdentifier}`);
    } catch (err) {
      toast.error("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full">
      {}
      <button 
        onClick={onBack} 
        className="flex items-center text-gray-500 hover:text-orange-600 mb-6 group transition-colors"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Registration</span>
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Verify Account</h2>
        <p className="text-gray-500 mt-2">
          Please enter the 6-digit code sent to your {verifyType.toLowerCase()}.
        </p>
      </div>

      {}
      <div className="relative flex bg-gray-100 p-1 rounded-full mb-8">
        <motion.div
          className="absolute inset-y-1 left-1 bg-white rounded-full shadow-sm w-[48%]"
          animate={{ x: verifyType === "EMAIL" ? "0%" : "104%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <button
          type="button"
          onClick={() => setVerifyType("EMAIL")}
          className={`relative z-10 flex-1 py-2 text-sm font-bold flex items-center justify-center transition-colors ${verifyType === "EMAIL" ? "text-orange-600" : "text-gray-500"}`}
        >
          <Mail size={16} className="mr-2" /> Email
        </button>
        <button
          type="button"
          onClick={() => setVerifyType("SMS")}
          className={`relative z-10 flex-1 py-2 text-sm font-bold flex items-center justify-center transition-colors ${verifyType === "SMS" ? "text-orange-600" : "text-gray-500"}`}
        >
          <Phone size={16} className="mr-2" /> Phone
        </button>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          label={verifyType === "EMAIL" ? "Business Email" : "Phone Number"}
          value={currentIdentifier}
          onChange={(e) => setCurrentIdentifier(e.target.value)}
          placeholder={verifyType === "EMAIL" ? "name@company.com" : "+91 98765..."}
          required
        />

        <Input
          label="Verification Code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="· · · · · ·"
          maxLength={6}
          className="text-center text-2xl tracking-[0.5em] font-bold"
          required
        />

        <div className="pt-2">
          <Button type="submit" className="w-full h-14" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="flex items-center justify-center w-full text-orange-600 font-bold hover:underline disabled:opacity-50"
        >
          <RefreshCcw size={16} className={`mr-2 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Resending..." : "Didn't receive code? Resend"}
        </button>
      </div>
    </div>
  );
};

export default AccountVerifyForm;