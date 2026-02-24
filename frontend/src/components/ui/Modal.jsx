import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, children, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {}
              <div className="flex-shrink-0 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100 bg-white">
                {title && (
                  <h2 className="text-2xl font-bold text-gray-800 pr-8">
                    {title}
                  </h2>
                )}
                {}
                <button
                  onClick={onClose}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;