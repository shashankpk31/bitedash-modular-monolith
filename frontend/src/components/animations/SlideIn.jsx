import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SlideIn - Slide animation for modals, drawers, sheets
 *
 * Usage:
 * <SlideIn show={isOpen} direction="bottom">
 *   <ModalContent />
 * </SlideIn>
 */
const SlideIn = ({
  children,
  show = true,
  direction = 'bottom', // 'bottom', 'top', 'left', 'right'
  className = '',
  duration = 0.3,
  onClose,
}) => {
  const slideVariants = {
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
  };

  const variants = slideVariants[direction];

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration * 0.8 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sliding content */}
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration,
            }}
            className={`fixed z-50 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideIn;
