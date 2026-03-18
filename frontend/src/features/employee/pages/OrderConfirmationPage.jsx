import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Card from '../../../components/ui/Card';
import orderService from '../../../services/orderService';
import { foodPlaceholder } from '../../../utils/placeholders';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    retry: 3,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Icon name="error" size={64} className="text-error mb-4" />
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
        <Button onClick={() => navigate('/employee/menu')}>Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <div className="bg-primary/10 rounded-full p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Icon name="check_circle" fill={1} size={64} className="text-primary" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
          Order Placed!
        </h1>
        <p className="text-center text-primary text-xl font-semibold mb-8">
          Order #{order.orderNumber || order.id}
        </p>

        {/* QR Code Card */}
        <Card padding="lg" className="mb-6">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
            Show this QR code to the vendor
          </p>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCodeSVG
                value={order.qrCode || `ORDER-${order.id}`}
                size={200}
                level="H"
                includeMargin
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Icon name="qr_code_scanner" />
            <span className="font-semibold">Ready for Scan</span>
          </div>
        </Card>

        {/* Estimated Time */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="schedule" className="text-orange-600" />
            <span className="text-orange-600 font-semibold">Estimated Prep Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ready in {order.estimatedPrepTime || 15} mins
          </div>
        </div>

        {/* Order Summary */}
        <Card padding="lg" className="mb-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Order Summary</h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <img
                  src={item.imageUrl || foodPlaceholder}
                  onError={(e) => { e.target.src = foodPlaceholder; }}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.quantity}x {item.name}
                  </div>
                  {item.addons?.length > 0 && (
                    <div className="text-sm text-gray-500">{item.addons.join(', ')}</div>
                  )}
                </div>
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  ${((item.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total Paid</span>
            <span className="text-2xl font-bold text-primary">
              ${(order.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/employee/menu')}
            icon={<Icon name="home" />}
          >
            Back to Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate('/employee/orders')}
          >
            View Order History
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmationPage;
