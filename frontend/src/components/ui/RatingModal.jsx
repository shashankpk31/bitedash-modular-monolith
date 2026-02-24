import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';

function RatingModal({ isOpen, onClose, order, onSubmitRating }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmitRating({
        orderId: order.id,
        rating,
        feedback: feedback.trim() || null,
      });

      toast.success('Thank you for your feedback!');
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit rating');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
    setSubmitting(false);
    onClose();
  };

  const getRatingLabel = (value) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return labels[value] || 'Select rating';
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rate Your Order">
      <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="text-lg font-bold text-gray-800">{order.orderNumber}</p>
        </div>

        {}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-gray-700">
            How was your experience?
          </p>

          {}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={40}
                  fill={star <= (hoveredRating || rating) ? '#f97316' : 'none'}
                  stroke={star <= (hoveredRating || rating) ? '#f97316' : '#d1d5db'}
                  className="transition-colors"
                />
              </button>
            ))}
          </div>

          {}
          <p className="text-lg font-semibold text-brand-primary">
            {getRatingLabel(hoveredRating || rating)}
          </p>
        </div>

        {}
        <div>
          <label
            htmlFor="feedback"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Additional Feedback (Optional)
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Tell us more about your experience..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {feedback.length}/500 characters
          </p>
        </div>

        {}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            disabled={rating === 0 || submitting}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Rating
              </>
            )}
          </Button>
        </div>

        {}
        <p className="text-xs text-gray-500 text-center">
          Your feedback helps us improve our service
        </p>
      </form>
    </Modal>
  );
}

export default RatingModal;
