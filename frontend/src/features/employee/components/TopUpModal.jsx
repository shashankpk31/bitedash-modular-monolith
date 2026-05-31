import { useState } from 'react';
import { X, CreditCard, IndianRupee, AlertCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../common/components/Button';
import { createPaymentOrder, verifyPayment, getPaymentConfig } from '../../../services/api/wallet.api';
import { formatCurrency } from '../../../common/utils';

// Preset amounts for quick selection
const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

/**
 * TopUpModal - Modal for wallet top-up via Razorpay
 *
 * Flow:
 * 1. User selects amount
 * 2. Frontend calls /payment/create-order
 * 3. Opens Razorpay checkout (or simulator checkout page)
 * 4. On success, frontend calls /payment/verify
 * 5. Backend verifies signature and credits wallet
 */
const TopUpModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState('select'); // select | processing | success | error
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset state when modal closes
  const handleClose = () => {
    setAmount('');
    setCustomAmount('');
    setStep('select');
    setError(null);
    setLoading(false);
    onClose();
  };

  // Get final amount (preset or custom)
  const getFinalAmount = () => {
    if (customAmount) {
      return parseFloat(customAmount);
    }
    return amount ? parseFloat(amount) : 0;
  };

  // Validate amount
  const isValidAmount = () => {
    const finalAmount = getFinalAmount();
    return finalAmount >= 10 && finalAmount <= 50000;
  };

  // Handle amount selection
  const handlePresetClick = (presetAmount) => {
    setAmount(presetAmount.toString());
    setCustomAmount('');
  };

  // Handle custom amount change
  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      setAmount('');
    }
  };

  // Start payment process
  const handleProceed = async () => {
    if (!isValidAmount()) {
      setError('Please enter an amount between Rs. 10 and Rs. 50,000');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      // Get payment config
      const config = await getPaymentConfig();

      // Create payment order
      const order = await createPaymentOrder({
        amount: getFinalAmount(),
        description: 'Wallet Top-up'
      });

      // Check if we have a checkout URL (simulator mode)
      if (order.checkoutUrl) {
        // Open checkout in new window for simulator
        openSimulatorCheckout(order.checkoutUrl, order.id, config.keyId);
      } else {
        // Use Razorpay SDK for production
        openRazorpayCheckout(order, config.keyId);
      }
    } catch (err) {
      console.error('Failed to create payment order:', err);
      setError(err.message || 'Failed to create payment order');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  // Open simulator checkout page
  const openSimulatorCheckout = (checkoutUrl, orderId, keyId) => {
    // Open checkout in a popup window
    const popup = window.open(
      checkoutUrl,
      'razorpay_checkout',
      'width=500,height=600,scrollbars=yes'
    );

    // Listen for messages from the checkout page
    const handleMessage = async (event) => {
      // Only accept messages from localhost (simulator)
      if (!event.origin.includes('localhost')) return;

      if (event.data.type === 'razorpay_payment_success') {
        window.removeEventListener('message', handleMessage);
        popup?.close();

        // Verify payment
        await verifyPaymentResult({
          razorpay_order_id: event.data.razorpay_order_id,
          razorpay_payment_id: event.data.razorpay_payment_id,
          razorpay_signature: event.data.razorpay_signature
        });
      } else if (event.data.type === 'razorpay_payment_failed') {
        window.removeEventListener('message', handleMessage);
        popup?.close();
        setError('Payment failed. Please try again.');
        setStep('select');
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was closed manually
    const checkPopupClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener('message', handleMessage);
        if (step === 'processing') {
          setStep('select');
          setError('Payment was cancelled');
        }
      }
    }, 500);
  };

  // Open Razorpay checkout SDK (production)
  const openRazorpayCheckout = (order, keyId) => {
    // Check if Razorpay SDK is loaded
    if (!window.Razorpay) {
      setError('Payment SDK not loaded. Please refresh and try again.');
      setStep('select');
      return;
    }

    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'BiteDash',
      description: 'Wallet Top-up',
      order_id: order.id,
      handler: async (response) => {
        await verifyPaymentResult(response);
      },
      modal: {
        ondismiss: () => {
          setStep('select');
          setError('Payment was cancelled');
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#6366F1'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // Verify payment result
  const verifyPaymentResult = async (paymentData) => {
    setLoading(true);
    setStep('processing');

    try {
      const result = await verifyPayment(paymentData);

      // Axios interceptor returns data directly (not wrapped in success object)
      // Check if payment data exists (orderId and paymentId)
      if (result && result.orderId && result.paymentId) {
        setStep('success');
        // Notify parent to refresh wallet data
        if (onSuccess) {
          setTimeout(() => {
            // Amount is in paise, convert to rupees
            const amountInRupees = result.amount / 100;
            onSuccess(amountInRupees);
            handleClose();
          }, 2000);
        }
      } else {
        setError(result?.message || 'Payment verification failed');
        setStep('error');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      setError(err.message || 'Payment verification failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={step === 'select' ? handleClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/15">
            <h2 className="font-headline text-headline-md text-on-surface">
              Top Up Wallet
            </h2>
            {step === 'select' && (
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Select Amount Step */}
            {step === 'select' && (
              <div className="space-y-6">
                {/* Preset Amounts */}
                <div>
                  <label className="text-label-md text-on-surface-variant mb-3 block">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handlePresetClick(preset)}
                        className={`py-3 px-4 rounded-lg font-headline text-body-lg transition-colors ${
                          amount === preset.toString()
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {formatCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount - Hidden when preset selected */}
                {!amount && (
                  <div>
                    <label className="text-label-md text-on-surface-variant mb-2 block">
                      Or Enter Custom Amount
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <IndianRupee size={20} className="text-on-surface-variant" />
                      </div>
                      <input
                        type="text"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="Enter amount"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-body-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      Min: Rs. 10 | Max: Rs. 50,000
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error">
                    <AlertCircle size={20} />
                    <span className="text-body-sm">{error}</span>
                  </div>
                )}

                {/* Proceed Button - CTA styled */}
                <Button
                  variant="filled"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary-dim hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 transform hover:scale-[1.02] font-semibold"
                  onClick={handleProceed}
                  disabled={!isValidAmount() || loading}
                >
                  <CreditCard size={20} className="mr-2" />
                  {loading ? 'Creating Order...' : `Pay ${formatCurrency(getFinalAmount())}`}
                </Button>
              </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <div className="text-center py-8 space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent"
                />
                <h3 className="font-headline text-headline-sm text-on-surface">
                  Processing Payment
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  Please complete the payment in the checkout window...
                </p>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="text-center py-8 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto rounded-full bg-green-500 flex items-center justify-center"
                >
                  <Check size={32} className="text-white" />
                </motion.div>
                <h3 className="font-headline text-headline-sm text-on-surface">
                  Payment Successful!
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  {formatCurrency(getFinalAmount())} has been added to your wallet
                </p>
              </div>
            )}

            {/* Error Step */}
            {step === 'error' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-error/10 flex items-center justify-center">
                  <AlertCircle size={32} className="text-error" />
                </div>
                <h3 className="font-headline text-headline-sm text-on-surface">
                  Payment Failed
                </h3>
                <p className="text-body-md text-on-surface-variant">{error}</p>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setStep('select');
                    setError(null);
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TopUpModal;
