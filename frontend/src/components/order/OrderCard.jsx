import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import QRCodeDisplay from '../ui/QRCodeDisplay';
import RatingModal from '../ui/RatingModal';
import { Button } from '../ui/Button';

function OrderCard({ order, onRate, showQR = true }) {
  const [expanded, setExpanded] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
      READY: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={18} />;
      case 'CANCELLED':
        return <XCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  const canRate = order.status === 'COMPLETED' && !order.rating;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        {}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-gray-800 truncate">
                {order.orderNumber}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {}
            <div
              className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl font-medium text-xs md:text-sm border whitespace-nowrap ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusIcon(order.status)}
              {order.status}
            </div>
          </div>

          {}
          <div className="mt-3 md:mt-4 flex flex-wrap gap-2 md:gap-3">
            {order.orderType && (
              <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                <Package size={14} className="md:w-4 md:h-4" />
                <span className="font-medium">{order.orderType}</span>
              </div>
            )}
            {order.scheduledTime && (
              <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                <Clock size={14} className="md:w-4 md:h-4" />
                <span>Scheduled: {new Date(order.scheduledTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {order.specialInstructions && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-medium text-blue-900 mb-1">
                Special Instructions:
              </p>
              <p className="text-sm text-blue-800">{order.specialInstructions}</p>
            </div>
          )}
        </div>

        {}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">Order Items</h4>
          <div className="space-y-1.5 md:space-y-2">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="flex justify-between text-xs md:text-sm gap-2">
                <span className="text-gray-800 flex-1 min-w-0 truncate">
                  {item.quantity}x {item.menuItemName}
                </span>
                <span className="font-semibold text-gray-900 whitespace-nowrap">
                  ₹{item.unitPrice * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {}
          <div className="mt-3 md:mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm md:text-base font-semibold text-gray-800">Total Amount</span>
            <span className="text-lg md:text-xl font-bold text-brand-primary">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        {}
        {showQR && order.qrCodeData && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <span className="text-sm md:text-base font-semibold text-gray-800">Show QR Code</span>
              {expanded ? (
                <ChevronUp className="text-gray-400" size={18} />
              ) : (
                <ChevronDown className="text-gray-400" size={18} />
              )}
            </button>

            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 md:px-6 pb-4 md:pb-6"
              >
                <QRCodeDisplay
                  qrCodeData={order.qrCodeData}
                  orderNumber={order.orderNumber}
                  size={160}
                  className="mx-auto"
                />
              </motion.div>
            )}
          </div>
        )}

        {}
        {order.status === 'COMPLETED' && (
          <div className="p-4 md:p-6">
            {order.rating ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 md:p-4 bg-green-50 border border-green-100 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-0.5 md:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="md:w-[18px] md:h-[18px]"
                      fill={i < order.rating ? '#f97316' : 'none'}
                      stroke={i < order.rating ? '#f97316' : '#d1d5db'}
                    />
                  ))}
                </div>
                <span className="text-xs md:text-sm font-medium text-green-900">
                  You rated this order
                </span>
              </div>
            ) : (
              <Button
                onClick={() => setRatingModalOpen(true)}
                variant="primary"
                className="w-full flex items-center justify-center gap-2 min-h-[44px] text-sm md:text-base"
              >
                <Star size={16} className="md:w-[18px] md:h-[18px]" />
                Rate this Order
              </Button>
            )}

            {order.feedback && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg md:rounded-xl">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Your Feedback:
                </p>
                <p className="text-xs md:text-sm text-gray-600">{order.feedback}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        order={order}
        onSubmitRating={onRate}
      />
    </>
  );
}

export default OrderCard;
