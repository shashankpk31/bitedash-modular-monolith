import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';

const AnimatedPhoneMockup = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Browse Menu',
      subtitle: 'Employee explores delicious options',
      icon: 'restaurant_menu',
      color: 'bg-blue-500',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
            <div className="w-10 h-10 bg-orange-400 rounded-lg" />
            <div className="flex-1">
              <div className="h-2 bg-white/30 rounded w-3/4 mb-1" />
              <div className="h-1.5 bg-white/20 rounded w-1/2" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
            <div className="w-10 h-10 bg-green-400 rounded-lg" />
            <div className="flex-1">
              <div className="h-2 bg-white/30 rounded w-2/3 mb-1" />
              <div className="h-1.5 bg-white/20 rounded w-1/3" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Add to Cart',
      subtitle: 'Select items & customize',
      icon: 'shopping_cart',
      color: 'bg-green-500',
      content: (
        <div className="space-y-3">
          <div className="bg-white/10 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="h-2 bg-white/30 rounded w-1/3" />
              <div className="h-2 bg-white/30 rounded w-1/4" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-red-400 rounded" />
              <div className="w-8 h-8 bg-yellow-400 rounded" />
            </div>
          </div>
          <div className="flex justify-between items-center bg-orange-500/20 p-2 rounded-lg">
            <div className="h-2 bg-white/40 rounded w-1/4" />
            <div className="h-3 bg-white/50 rounded w-1/3" />
          </div>
        </div>
      )
    },
    {
      title: 'Place Order',
      subtitle: 'Confirm & pay with wallet',
      icon: 'payments',
      color: 'bg-purple-500',
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl">
            <div className="flex items-center justify-center mb-3">
              <Icon name="wallet" size={32} className="text-white" />
            </div>
            <div className="h-3 bg-white/40 rounded w-2/3 mx-auto mb-2" />
            <div className="h-2 bg-white/30 rounded w-1/2 mx-auto" />
          </div>
          <motion.div
            className="bg-green-500/30 p-2 rounded-lg flex items-center justify-center gap-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <Icon name="check_circle" size={20} className="text-green-300" />
            <div className="h-2 bg-white/40 rounded w-1/3" />
          </motion.div>
        </div>
      )
    },
    {
      title: 'Vendor Receives',
      subtitle: 'Order reaches kitchen',
      icon: 'store',
      color: 'bg-orange-500',
      content: (
        <div className="space-y-2">
          <div className="bg-orange-500/20 border-2 border-orange-400/50 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="restaurant" size={20} className="text-orange-300" />
                <div className="h-2 bg-white/40 rounded w-20" />
              </div>
              <div className="px-2 py-1 bg-red-500/30 rounded text-xs font-bold text-white">NEW</div>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-white/30 rounded w-3/4" />
              <div className="h-1.5 bg-white/30 rounded w-1/2" />
            </div>
          </div>
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex-1 bg-green-500/20 p-2 rounded-lg text-center">
              <div className="h-2 bg-white/40 rounded w-full" />
            </div>
            <div className="flex-1 bg-red-500/20 p-2 rounded-lg text-center">
              <div className="h-2 bg-white/40 rounded w-full" />
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Preparing',
      subtitle: 'Chef is cooking your meal',
      icon: 'schedule',
      color: 'bg-yellow-500',
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-500/20 p-4 rounded-xl">
            <div className="flex items-center justify-center mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Icon name="timer" size={36} className="text-yellow-300" />
              </motion.div>
            </div>
            <div className="h-2 bg-white/30 rounded w-full mb-2" />
            <div className="h-2 bg-yellow-400 rounded" style={{ width: '60%' }} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-12 bg-white/10 rounded-lg"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Ready to Collect',
      subtitle: 'Your order is ready!',
      icon: 'check_circle',
      color: 'bg-green-600',
      content: (
        <div className="space-y-3">
          <motion.div
            className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 p-4 rounded-xl border-2 border-green-400/50"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 1] }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Icon name="check_circle" size={48} fill={1} className="text-green-300" />
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-2 bg-white/40 rounded w-3/4 mx-auto" />
              <div className="h-2 bg-white/30 rounded w-1/2 mx-auto" />
            </div>
          </motion.div>
          <div className="bg-white/10 p-3 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon name="qr_code" size={24} className="text-white/80" />
              <div className="h-2 bg-white/40 rounded w-1/3" />
            </div>
            <div className="w-24 h-24 bg-white/20 rounded-lg mx-auto" />
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const currentStepData = steps[currentStep];

  return (
    <div className="relative w-[280px] h-[560px]">
      {/* Phone Frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[35px] shadow-2xl">
        {/* Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[20px] bg-black rounded-full z-20" />

        {/* Screen */}
        <div className="absolute top-12 left-4 right-4 bottom-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-[24px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={`h-full ${currentStepData.color} p-6 flex flex-col`}
            >
              {/* Header */}
              <div className="mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm"
                >
                  <Icon name={currentStepData.icon} size={32} className="text-white" />
                </motion.div>
                <h3 className="text-white text-lg font-bold mb-1">{currentStepData.title}</h3>
                <p className="text-white/80 text-xs">{currentStepData.subtitle}</p>
              </div>

              {/* Content */}
              <div className="flex-1">
                {currentStepData.content}
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                    initial={false}
                    animate={{
                      width: index === currentStep ? 32 : 6,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[140px] h-[5px] bg-gray-700 rounded-full" />
      </div>
    </div>
  );
};

export default AnimatedPhoneMockup;
