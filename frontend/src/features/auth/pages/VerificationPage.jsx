import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, ArrowLeft, Utensils, RefreshCw } from 'lucide-react';
import Button from '../../../common/components/Button';
import { useVerifyAccount, useResendOTP } from '../../../services/queries/auth.queries';
import { VALIDATION } from '../../../config/constants';

// OTP Verification Page
const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const verifyMutation = useVerifyAccount();
  const resendMutation = useResendOTP();

  // Get identifier from navigation state
  const identifier = location.state?.identifier;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP inputs
  const inputRefs = useRef([]);

  // Redirect if no identifier
  useEffect(() => {
    if (!identifier) {
      navigate('/register');
    }
  }, [identifier, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && value && newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle key down (backspace)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');

    setOtp(newOtp);
    setError('');

    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  // Verify OTP
  const handleVerify = (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    verifyMutation.mutate({
      identifier,
      otp: otpValue,
    });
  };

  // Resend OTP
  const handleResend = () => {
    if (!canResend) return;

    resendMutation.mutate(identifier, {
      onSuccess: () => {
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
      },
    });
  };

  // Detect if identifier is email or phone
  const isEmail = identifier?.includes('@');
  const Icon = isEmail ? Mail : Phone;
  const contactMethod = isEmail ? 'email' : 'phone number';
  const maskedIdentifier = identifier
    ? isEmail
      ? identifier.replace(/(.{2})(.*)(@.*)/, '$1****$3')
      : identifier.replace(/(\d{2})(\d{6})(\d{2})/, '$1****$3')
    : '';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-label-md">Back to registration</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-primary">
            <img src="/logo.svg" alt="BiteDash" className="w-10 h-10" />
          </div>
          <h1 className="font-headline text-headline-md text-on-surface">BiteDash</h1>
        </div>

        {/* Verification card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon size={32} className="text-primary" />
            </div>

            <h2 className="font-headline text-display-sm text-on-surface">
              Verify Your {contactMethod === 'email' ? 'Email' : 'Phone'}
            </h2>

            <p className="text-body-md text-on-surface-variant">
              We've sent a 6-digit code to{' '}
              <span className="font-semibold text-on-surface">{maskedIdentifier}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-label-md text-on-surface mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={verifyMutation.isPending}
                  className={`w-12 h-14 text-center text-headline-md font-headline bg-surface-container-low rounded-xl border-2 transition-all focus:outline-none ${
                    digit
                      ? 'border-primary bg-primary/5'
                      : error
                      ? 'border-error'
                      : 'border-outline-variant focus:border-primary'
                  } ${verifyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              ))}
            </div>
            {error && (
              <p className="text-label-sm text-error text-center mt-2">{error}</p>
            )}
          </div>

          {/* Verify button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => handleVerify()}
            loading={verifyMutation.isPending}
            disabled={verifyMutation.isPending || otp.some(digit => !digit)}
          >
            {verifyMutation.isPending ? 'Verifying...' : 'Verify Code'}
          </Button>

          {/* Resend section */}
          <div className="text-center space-y-2">
            <p className="text-body-sm text-on-surface-variant">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="flex items-center justify-center gap-2 mx-auto text-label-md text-primary hover:text-primary-dim font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={resendMutation.isPending ? 'animate-spin' : ''} />
                {resendMutation.isPending ? 'Sending...' : 'Resend Code'}
              </button>
            ) : (
              <p className="text-label-md text-on-surface-variant">
                Resend code in{' '}
                <span className="font-semibold text-primary">{resendTimer}s</span>
              </p>
            )}
          </div>

          {/* Help text */}
          <div className="pt-4 border-t border-outline-variant/15">
            <p className="text-label-sm text-on-surface-variant text-center">
              Make sure to check your spam folder if you don't see the {contactMethod === 'email' ? 'email' : 'message'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationPage;
