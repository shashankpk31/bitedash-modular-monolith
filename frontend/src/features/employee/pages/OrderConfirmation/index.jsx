import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import Icon from '../../../../components/ui/Icon';
import orderService from '../../../../services/orderService';

/**
 * Order Confirmation Screen with QR Code
 * Based on stitch: order_confirmation_qr
 *
 * POST-COMPLETION TODO:
 * 1. Integrate with real order API
 * 2. Generate QR code from actual pickup OTP/token
 * 3. Add real-time status updates via WebSocket
 * 4. Implement share order functionality
 */

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    // TODO: Use real API
    placeholderData: mockOrder,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const { orderNumber, pickupOtp, items, total, estimatedTime, status } = order || mockOrder;

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Top Navigation */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <button
          onClick={() => navigate('/employee/menu')}
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <Icon name="close" />
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          Order Confirmation
        </h2>
      </div>

      {/* Order Status Header */}
      <motion.div
        className="px-4 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
          <Icon name="check_circle" className="text-primary" size={48} fill={1} />
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-bold leading-tight pb-2">
          Order Placed!
        </h2>
        <p className="text-primary font-semibold text-base leading-normal pb-6">
          Order #{orderNumber}
        </p>
      </motion.div>

      {/* QR Code Section */}
      <motion.div
        className="px-4 pb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl flex flex-col items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Show this QR code to the vendor
          </p>

          {/* QR Code */}
          <div className="w-64 h-64 bg-white p-2 rounded-lg flex items-center justify-center">
            <QRCodeSVG
              value={pickupOtp || 'BD-1092-ABC123'}
              size={240}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-primary font-bold">
            <Icon name="qr_code_scanner" />
            <span>Ready for Scan</span>
          </div>

          {/* Alternative: Display OTP for manual verification */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 text-center">
              Pickup Code
            </p>
            <p className="text-2xl font-mono font-bold text-center tracking-wider">
              {pickupOtp?.substring(0, 6) || '123456'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Prep Time Info */}
      <motion.div
        className="px-4 flex gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-1 flex-col gap-1 rounded-xl p-5 bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="schedule" size={20} />
            <p className="text-sm font-medium">Estimated Prep Time</p>
          </div>
          <p className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-tight">
            Ready in {estimatedTime || '10'} mins
          </p>
        </div>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        className="p-4 mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-4">
          Order Summary
        </h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
                <div>
                  <p className="font-semibold">
                    {item.quantity}x {item.name}
                  </p>
                  {item.customizations && (
                    <p className="text-xs text-slate-500">{item.customizations}</p>
                  )}
                </div>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Paid</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Actions */}
      <div className="p-4 sticky bottom-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md space-y-3">
        <button
          onClick={() => navigate('/employee/orders')}
          className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ring-1 ring-slate-200 dark:ring-slate-700"
        >
          <Icon name="receipt_long" />
          View Order Details
        </button>
        <button
          onClick={() => navigate('/employee/menu')}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Icon name="home" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

// Mock order data (TODO: Replace with real API)
const mockOrder = {
  id: 1,
  orderNumber: 'BD-1092',
  pickupOtp: 'BD-1092-ABC123',
  status: 'CONFIRMED',
  estimatedTime: 10,
  total: 28.50,
  items: [
    {
      name: 'Smash Burger',
      quantity: 2,
      price: 12.00,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      customizations: 'No onions, Extra cheese',
    },
    {
      name: 'Large Fries',
      quantity: 1,
      price: 4.50,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
      customizations: 'Spicy seasoning',
    },
  ],
};

export default OrderConfirmation;
