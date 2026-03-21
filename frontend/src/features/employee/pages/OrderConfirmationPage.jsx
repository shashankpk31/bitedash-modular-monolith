import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Utensils, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import Badge, { StatusBadge } from '../../../common/components/Badge';
import { PageLoader } from '../../../common/components/Spinner';
import { useOrder, useCancelOrder } from '../../../services/queries/order.queries';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../../common/utils';
import { ORDER_STATUS } from '../../../config/constants';
import { useState } from 'react';
import { ConfirmModal } from '../../../common/components/Modal';

// Order Confirmation Page - Post-checkout order details and tracking
// Why? Shows order success and real-time status updates
const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Handle order cancellation
  const handleCancelOrder = () => {
    cancelOrderMutation.mutate(
      { orderId, reason: 'Customer requested cancellation' },
      {
        onSuccess: () => {
          setShowCancelConfirm(false);
        },
      }
    );
  };

  // Check if order can be cancelled (only if pending or confirmed)
  const canCancel = order?.status === ORDER_STATUS.PENDING || order?.status === ORDER_STATUS.CONFIRMED;

  // Loading state
  if (isLoading) {
    return <PageLoader message="Loading order details..." />;
  }

  // Error state
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="font-headline text-headline-lg text-on-surface">Order Not Found</h2>
          <p className="text-body-md text-on-surface-variant">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => navigate('/employee/orders')}>
            View All Orders
          </Button>
        </div>
      </div>
    );
  }

  // Order status steps for visual progress
  const statusSteps = [
    { status: ORDER_STATUS.PENDING, label: 'Order Placed', icon: CheckCircle },
    { status: ORDER_STATUS.CONFIRMED, label: 'Confirmed', icon: CheckCircle },
    { status: ORDER_STATUS.PREPARING, label: 'Preparing', icon: Utensils },
    { status: ORDER_STATUS.READY, label: 'Ready', icon: CheckCircle },
    { status: ORDER_STATUS.PICKED_UP, label: 'Picked Up', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === order.status);

  return (
    <div className="min-h-full pb-8">
      {/* Success Header */}
      <div className="bg-surface-container-low p-6 text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-20 h-20 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center"
        >
          <CheckCircle size={40} className="text-green-600" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="font-headline text-display-sm text-on-surface">
            Order Placed Successfully!
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Order #{order.id} • {formatRelativeTime(order.createdAt)}
          </p>
        </div>

        {/* Status Badge */}
        <StatusBadge status={order.status} size="lg" />
      </div>

      {/* Order Status Progress */}
      {order.status !== ORDER_STATUS.CANCELLED && (
        <div className="p-6 space-y-4">
          <h2 className="font-headline text-headline-md text-on-surface">Order Status</h2>

          <div className="relative">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 transition-colors ${
                          isCompleted ? 'bg-primary' : 'bg-outline-variant'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div
                      className={`font-headline text-body-lg ${
                        isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {step.label}
                    </div>
                    {isCurrent && order.estimatedTime && (
                      <div className="text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
                        <Clock size={14} />
                        Ready in ~{order.estimatedTime} min
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="p-6 space-y-6">
        {/* Vendor Info */}
        <div className="bg-surface-container-lowest rounded-xl p-4 space-y-3">
          <h3 className="font-headline text-headline-sm text-on-surface">Vendor Details</h3>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
              <Utensils size={20} className="text-on-surface-variant" />
            </div>
            <div className="flex-1">
              <div className="font-headline text-body-lg text-on-surface">
                {order.vendorName || 'Vendor'}
              </div>
              {order.vendorPhone && (
                <div className="text-label-md text-on-surface-variant flex items-center gap-2 mt-1">
                  <Phone size={14} />
                  {order.vendorPhone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <h3 className="font-headline text-headline-sm text-on-surface">Order Items</h3>
          <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/15">
            {order.items?.map((item, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-headline text-body-md text-on-surface">
                    {item.itemName || item.name}
                  </div>
                  <div className="text-label-sm text-on-surface-variant mt-1">
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </div>
                </div>
                <div className="font-headline text-body-lg text-on-surface">
                  {formatCurrency(item.quantity * item.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-surface-container-lowest rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-body-md">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-on-surface">{formatCurrency(order.subtotal || order.totalAmount)}</span>
          </div>
          {order.tax && (
            <div className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant">Tax</span>
              <span className="text-on-surface">{formatCurrency(order.tax)}</span>
            </div>
          )}
          <div className="h-px bg-outline-variant/15 my-2" />
          <div className="flex items-center justify-between">
            <span className="font-headline text-headline-sm text-on-surface">Total Paid</span>
            <span className="font-headline text-headline-lg text-primary">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/employee/menu')}
          >
            Order Again
          </Button>

          {canCancel && (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelOrderMutation.isPending}
              className="border-error text-error hover:bg-error/10"
            >
              Cancel Order
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => navigate('/employee/orders')}
          >
            View All Orders
          </Button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelOrder}
        loading={cancelOrderMutation.isPending}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? You will receive a refund to your wallet."
        confirmText="Cancel Order"
        cancelText="Keep Order"
        variant="danger"
      />
    </div>
  );
};

export default OrderConfirmationPage;
