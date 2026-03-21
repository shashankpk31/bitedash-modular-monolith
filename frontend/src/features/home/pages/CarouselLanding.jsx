import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, ShoppingCart, Clock, QrCode, Wallet,
  Check, Plus, Send, History, CheckCircle, Coffee,
  UtensilsCrossed, FastForward
} from 'lucide-react';
import { useAuth } from '../../../contexts';
import { getRoleBasedPath } from '../../../config/constants';

// Carousel Landing - Mobile-first onboarding experience
// Why? Better mobile UX with swipeable slides
const CarouselLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Welcome to BiteDash',
      subtitle: 'Smart Corporate Dining Platform',
      description: 'Order delicious food from multiple vendors, track your orders in real-time, and enjoy cashless payments.',
      icon: Utensils,
      color: 'from-[#FA8112] to-[#DF7F14]',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-br from-[#FA8112]/20 to-[#DF7F14]/20 rounded-full"
          />
          <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center shadow-xl">
            <img src="/logo.svg" alt="BiteDash" className="w-12 h-12" />
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 right-2 bg-primary/10 p-2 rounded-full"
          >
            <UtensilsCrossed size={18} className="text-primary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-2 left-2 bg-secondary/10 p-2 rounded-full"
          >
            <Coffee size={18} className="text-secondary" />
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Browse & Order',
      subtitle: 'Multiple Vendors, One App',
      description: 'Explore menus from all cafeteria vendors, customize your order, and place it in just a few taps.',
      icon: ShoppingCart,
      color: 'from-[#DF7F14] to-[#FA8112]',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto">
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-2 rounded-xl shadow-lg"
              >
                <div className="w-full h-10 bg-gradient-to-br from-[#DF7F14]/30 to-[#FA8112]/30 rounded-lg mb-1" />
                <div className="h-1.5 bg-slate-200 rounded mb-1" />
                <div className="h-1.5 bg-slate-200 rounded w-2/3" />
              </motion.div>
            ))}
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-full shadow-xl"
          >
            <ShoppingCart size={20} />
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Track Your Order',
      subtitle: 'Real-Time Updates',
      description: 'Know exactly when your food is ready. Get notifications at every step from preparation to pickup.',
      icon: Clock,
      color: 'from-[#FCC219] to-[#F5B03E]',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto flex items-center justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-tertiary/20 rounded-full blur-xl"
            />
            <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
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
                        i === 0 ? 'bg-success' : i === 1 ? 'bg-tertiary' : 'bg-slate-300'
                      }`}
                    >
                      {i < 2 && <Check size={12} className="text-white" />}
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
      icon: QrCode,
      color: 'from-[#FA8112] to-[#DF7F14]',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-white p-4 rounded-2xl shadow-2xl"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-xl flex items-center justify-center">
              <QrCode size={48} className="text-primary" />
            </div>
            <div className="mt-2 text-center">
              <div className="h-1.5 bg-slate-200 rounded mb-1" />
              <div className="h-1.5 bg-slate-200 rounded w-2/3 mx-auto" />
            </div>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-2 -right-2 bg-secondary text-white p-2 rounded-full shadow-xl"
          >
            <CheckCircle size={18} />
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Digital Wallet',
      subtitle: 'Cashless & Seamless',
      description: 'Manage your balance, add money, and pay instantly. All transactions are secure and tracked.',
      icon: Wallet,
      color: 'from-[#FCC219] to-[#FA8112]',
      illustration: (
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#FCC219] to-[#FA8112] p-4 rounded-2xl shadow-2xl text-white w-40">
              <div className="flex items-center justify-between mb-3">
                <Wallet size={20} />
                <div className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-full">Active</div>
              </div>
              <div className="mb-4">
                <div className="text-[10px] opacity-80 mb-0.5">Balance</div>
                <div className="text-xl font-bold">₹125.50</div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-white/10 p-1.5 rounded-lg text-center">
                  <Plus size={12} className="mx-auto mb-0.5" />
                  <div className="text-[9px]">Add</div>
                </div>
                <div className="bg-white/10 p-1.5 rounded-lg text-center">
                  <Send size={12} className="mx-auto mb-0.5" />
                  <div className="text-[9px]">Pay</div>
                </div>
                <div className="bg-white/10 p-1.5 rounded-lg text-center">
                  <History size={12} className="mx-auto mb-0.5" />
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
    // Redirect if already logged in
    if (user) {
      const redirectPath = getRoleBasedPath(user.role);
      navigate(redirectPath);
    }
  }, [user, navigate]);

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
  const IconComponent = currentSlideData.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Logo */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10 safe-top">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <img src="/logo.svg" alt="BiteDash" className="w-8 h-8" />
        </div>
        <span className="font-headline font-bold text-lg text-on-surface">BiteDash</span>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-4 right-4 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors z-10 safe-top px-3 py-1.5 rounded-lg hover:bg-surface-container"
      >
        Skip
      </button>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:py-8">
        <div className="max-w-4xl w-full my-auto">
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
                <IconComponent size={24} className="text-white md:w-8 md:h-8" />
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
                <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-black mb-2 md:mb-3 text-on-surface">
                  {currentSlideData.title}
                </h1>
                <p className="font-headline text-lg md:text-xl lg:text-2xl font-semibold text-primary mb-2 md:mb-3">
                  {currentSlideData.subtitle}
                </p>
                <p className="text-on-surface-variant text-sm md:text-base lg:text-lg leading-relaxed">
                  {currentSlideData.description}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-2 md:gap-2.5 mt-6 md:mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? 'w-8 h-2.5 md:w-10 md:h-3 bg-primary'
                    : 'w-2.5 h-2.5 md:w-3 md:h-3 bg-outline-variant hover:bg-outline'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-surface/95 border-t border-outline-variant backdrop-blur-md shadow-ambient-lg z-50 safe-bottom">
        <div className="max-w-lg mx-auto px-4 py-4 md:py-3">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-3.5 md:py-3 rounded-xl font-bold text-sm text-on-surface bg-surface-container hover:bg-surface-container-high transition-all active:scale-95 shadow-card"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 py-3.5 md:py-3 rounded-xl font-bold text-sm text-on-primary bg-primary hover:shadow-primary transition-all active:scale-95 shadow-ambient"
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
