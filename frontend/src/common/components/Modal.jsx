import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import Button from './Button';

// Modal component with glassmorphism backdrop
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeable = true,
  closeOnBackdrop = true,
  className = '',
}) => {
  // Prevent body scroll when modal is open
  // Why? Improves UX by keeping focus on modal content
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeable, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop && closeable) {
      onClose();
    }
  };

  return (
    // Portal-like overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in"
      onClick={handleBackdropClick}
    >
      {/* Modal container */}
      <div
        className={`bg-surface-container-lowest rounded-2xl shadow-ambient-lg w-full ${sizeStyles[size]} max-h-[90vh] flex flex-col animate-in ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        {(title || closeable) && (
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/15">
            {title && (
              <h2
                id="modal-title"
                className="font-headline text-headline-md text-on-surface"
              >
                {title}
              </h2>
            )}
            {closeable && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-outline-variant/15">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeable: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  className: PropTypes.string,
};

// Confirmation Modal with preset actions
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </>
    }
  >
    <p className="text-body-lg text-on-surface-variant">{message}</p>
  </Modal>
);

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.string,
  loading: PropTypes.bool,
};

export default Modal;
