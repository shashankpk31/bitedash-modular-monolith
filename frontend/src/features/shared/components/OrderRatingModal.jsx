import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import orderService from '../../employee/services/orderService';
import toast from 'react-hot-toast';

const OrderRatingModal = ({ isOpen, onClose, order }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const rateOrderMutation = useMutation({
    mutationFn: async ({ orderId, ratingData }) => {
      return await orderService.rateOrder(orderId, ratingData);
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      queryClient.invalidateQueries(['my-orders']);
      queryClient.invalidateQueries(['order', order?.id]);
      handleClose();
    },
    onError: (error) => {
      toast.error(error || 'Failed to submit rating');
    },
  });

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!order?.id) {
      toast.error('Order information missing');
      return;
    }

    rateOrderMutation.mutate({
      orderId: order.id,
      ratingData: {
        rating,
        feedback: feedback.trim() || null,
      },
    });
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={40}
              className={`transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return texts[rating] || 'Select a rating';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rate Your Order">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Info */}
        {order && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
            {order.vendorName && (
              <>
                <p className="text-sm text-gray-600 mt-2 mb-1">Vendor</p>
                <p className="font-semibold text-gray-900">{order.vendorName}</p>
              </>
            )}
          </div>
        )}

        {/* Rating Stars */}
        <div className="text-center">
          <p className="text-gray-700 font-semibold mb-4">How was your experience?</p>
          {renderStars()}
          <p
            className={`text-lg font-semibold transition-colors ${
              rating > 0 ? 'text-brand-primary' : 'text-gray-400'
            }`}
          >
            {getRatingText(hoveredRating || rating)}
          </p>
        </div>

        {/* Feedback Textarea */}
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <MessageSquare size={16} className="mr-2" />
            Additional Feedback (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {feedback.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={rating === 0 || rateOrderMutation.isPending}
          className="w-full py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {rateOrderMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Submitting...
            </>
          ) : (
            'Submit Rating'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default OrderRatingModal;
