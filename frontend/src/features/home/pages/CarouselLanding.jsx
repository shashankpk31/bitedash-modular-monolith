import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import { LOCL_STRG_KEY, ROLES } from '../../../config/constants';

const CarouselLanding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Welcome to BiteDash',
      subtitle: 'Smart Corporate Dining Platform',
      description: 'Order delicious food from multiple vendors, track your orders in real-time, and enjoy cashless payments.',
      icon: 'restaurant',
      color: 'from-orange-500 to-red-500',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full"
          />
          <div className="absolute inset-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="restaurant" size={48} className="text-primary" />
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 right-2 bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full"
          >
            <Icon name="fastfood" size={18} className="text-orange-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-2 left-2 bg-red-100 dark:bg-red-900/30 p-2 rounded-full"
          >
            <Icon name="local_cafe" size={18} className="text-red-600" />
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Browse & Order',
      subtitle: 'Multiple Vendors, One App',
      description: 'Explore menus from all cafeteria vendors, customize your order, and place it in just a few taps.',
      icon: 'shopping_cart',
      color: 'from-blue-500 to-indigo-500',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto">
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg"
              >
                <div className="w-full h-10 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-lg mb-1" />
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </motion.div>
            ))}
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2.5 rounded-full shadow-xl"
          >
            <Icon name="shopping_cart" size={20} />
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Track Your Order',
      subtitle: 'Real-Time Updates',
      description: 'Know exactly when your food is ready. Get notifications at every step from preparation to pickup.',
      icon: 'schedule',
      color: 'from-green-500 to-emerald-500',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto flex items-center justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"
            />
            <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl">
              <div className="space-y-2">
                {['Order Placed', 'Preparing', 'Ready'].map((status, i) => (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={i === 1 ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : 'bg-slate-300'
                      }`}
                    >
                      {i < 2 && <Icon name="check" size={12} className="text-white" />}
                    </motion.div>
                    <span className="text-xs font-medium">{status}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'QR Code Pickup',
      subtitle: 'Skip the Queue',
      description: 'Show your QR code to the vendor and collect your order instantly. No waiting, no hassle.',
      icon: 'qr_code',
      color: 'from-purple-500 to-pink-500',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-xl flex items-center justify-center">
              <Icon name="qr_code" size={48} className="text-purple-600" />
            </div>
            <div className="mt-2 text-center">
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto" />
            </div>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-2 -right-2 bg-pink-500 text-white p-2 rounded-full shadow-xl"
          >
            <Icon name="check_circle" size={18} />
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Digital Wallet',
      subtitle: 'Cashless & Seamless',
      description: 'Manage your balance, add money, and pay instantly. All transactions are secure and tracked.',
      icon: 'wallet',
      color: 'from-cyan-500 to-blue-500',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-2xl text-white w-40">
              <div className="flex items-center justify-between mb-3">
                <Icon name="wallet" size={20} />
                <div className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-full">Active</div>
              </div>
              <div className="mb-4">
                <div className="text-[10px] opacity-80 mb-0.5">Balance</div>
                <div className="text-xl font-bold">$125.50</div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-white/10 p-1.5 rounded-lg text-center">
                  <Icon name="add" size={12} className="mx-auto mb-0.5" />
                  <div className="text-[9px]">Add</div>
                </div>
                <div className="bg-white/10 p-1.5 rounded-lg text-center">
                  <Icon name="send" size={12} className="mx-auto mb-0.5" />
                  <div className="text-[9px]">Pay</div>
                </div>
                <div className="bg-white/10 p-1.5 rounded-lg text-center">
                  <Icon name="history" size={12} className="mx-auto mb-0.5" />
                  <div className="text-[9px]">History</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem(LOCL_STRG_KEY.TOKEN);
    const storedUser = localStorage.getItem(LOCL_STRG_KEY.USER);

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const routes = {
          [ROLES.SUPER_ADMIN]: '/admin/dashboard',
          [ROLES.ORG_ADMIN]: '/org-admin/dashboard',
          [ROLES.VENDOR]: '/vendor/dashboard',
          [ROLES.EMPLOYEE]: '/employee/menu',
        };
        navigate(routes[user.role] || '/');
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col safe-area-inset">
      {/* Logo */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pt-safe">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Icon name="restaurant" size={20} className="text-white" />
        </div>
        <span className="font-bold text-lg">BiteDash</span>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-4 right-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors z-10 pt-safe"
      >
        Skip
      </button>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 50;
                if (offset.x > swipeThreshold) {
                  prevSlide();
                } else if (offset.x < -swipeThreshold) {
                  nextSlide();
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center cursor-grab active:cursor-grabbing"
            >
              {/* Icon Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${currentSlideData.color} mb-3 md:mb-4 shadow-lg`}
              >
                <Icon name={currentSlideData.icon} size={24} className="text-white md:w-8 md:h-8" />
              </motion.div>

              {/* Illustration */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4 md:mb-6"
              >
                {currentSlideData.illustration}
              </motion.div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-2xl mx-auto px-2"
              >
                <h1 className="text-xl md:text-3xl lg:text-4xl font-black mb-1.5 md:mb-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {currentSlideData.title}
                </h1>
                <p className="text-base md:text-lg lg:text-xl font-semibold text-primary mb-1.5 md:mb-3">
                  {currentSlideData.subtitle}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base leading-relaxed">
                  {currentSlideData.description}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-4 md:mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? 'w-5 h-2 md:w-6 md:h-2.5 bg-gradient-to-r ' + currentSlideData.color
                    : 'w-2 h-2 md:w-2.5 md:h-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-2xl z-50">
        <div className="max-w-lg mx-auto px-4 py-2.5 safe-area-inset-bottom">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${currentSlideData.color} hover:shadow-lg transition-all active:scale-95 shadow-md`}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselLanding;
