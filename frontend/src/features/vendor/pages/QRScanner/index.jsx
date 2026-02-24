import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRScanner from '../../../../components/ui/QRScanner';
import { Package, CheckCircle, Clock, User } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';
import axios from 'axios';

function QRScannerPage() {
  const [scannedOrder, setScannedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQRScan = async (qrCodeData) => {
    setLoading(true);
    try {
      
      const response = await axios.get(`/api/orders/qr/${qrCodeData}`);

      if (response.data.success) {
        setScannedOrder(response.data.data);
        toast.success('Order details loaded successfully!');
      } else {
        toast.error(response.data.message || 'Failed to fetch order');
        setScannedOrder(null);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error(error.response?.data?.message || 'Invalid QR code');
      setScannedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!scannedOrder) return;

    try {
      const response = await axios.put(
        `/api/orders/${scannedOrder.id}/status?status=${newStatus}`
      );

      if (response.data.success) {
        setScannedOrder(response.data.data);
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const resetScanner = () => {
    setScannedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Order QR Scanner
          </h1>
          <p className="text-gray-600">
            Scan customer QR codes to verify and process orders
          </p>
        </div>

        <div className="grid gap-6">
          {}
          {!scannedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <QRScanner onScan={handleQRScan} />
            </motion.div>
          )}

          {}
          {loading && (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent" />
            </div>
          )}

          {}
          {scannedOrder && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            >
              {}
              <div className="p-6 bg-green-50 border-b border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-green-900">
                      Order Verified
                    </h3>
                    <p className="text-sm text-green-700">
                      Order #{scannedOrder.orderNumber}
                    </p>
                  </div>
                </div>
              </div>

              {}
              <div className="p-6 space-y-6">
                {}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={18} />
                    Customer Information
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order Type:</span>
                      <span className="font-medium text-gray-800">
                        {scannedOrder.orderType || 'DINE_IN'}
                      </span>
                    </div>
                    {scannedOrder.scheduledTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Scheduled Time:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(scannedOrder.scheduledTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {}
                {scannedOrder.specialInstructions && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Special Instructions
                    </h4>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-sm text-blue-800">
                        {scannedOrder.specialInstructions}
                      </p>
                    </div>
                  </div>
                )}

                {}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package size={18} />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {scannedOrder.orderItems?.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.quantity}x {item.menuItemName}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">
                          ₹{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-brand-primary">
                      ₹{scannedOrder.totalAmount}
                    </span>
                  </div>
                </div>

                {}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Update Order Status
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {scannedOrder.status === 'PENDING' && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus('CONFIRMED')}
                          variant="primary"
                        >
                          Confirm Order
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus('CANCELLED')}
                          variant="danger"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {scannedOrder.status === 'CONFIRMED' && (
                      <Button
                        onClick={() => handleUpdateStatus('PREPARING')}
                        variant="primary"
                        className="col-span-2"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {scannedOrder.status === 'PREPARING' && (
                      <Button
                        onClick={() => handleUpdateStatus('READY')}
                        variant="primary"
                        className="col-span-2"
                      >
                        Mark as Ready
                      </Button>
                    )}
                    {scannedOrder.status === 'READY' && (
                      <Button
                        onClick={() => handleUpdateStatus('COMPLETED')}
                        variant="primary"
                        className="col-span-2"
                      >
                        Complete Order
                      </Button>
                    )}
                  </div>
                </div>

                {}
                <Button
                  onClick={resetScanner}
                  variant="outline"
                  className="w-full"
                >
                  Scan Another Order
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRScannerPage;
