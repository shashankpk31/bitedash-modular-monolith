import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { useLocation } from '../../../../context/LocationContext';
import LocationSelector from '../../components/LocationSelector';
import toast from 'react-hot-toast';

const Welcome = () => {
  const navigate = useNavigate();
  const { setLocation, isConfigured } = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  // Skip welcome if already configured
  useEffect(() => {
    if (isConfigured) {
      navigate('/employee/home', { replace: true });
    }
  }, [isConfigured, navigate]);

  // Show location selector after intro animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setShowSelector(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleLocationComplete = (locationData) => {
    setLocation(locationData);
    toast.success(`Welcome to ${locationData.cafeteriaName}!`, {
      icon: '🎉',
      duration: 3000,
    });

    // Navigate to home after a short delay
    setTimeout(() => {
      navigate('/employee/home', { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AnimatePresence mode="wait">
        {/* Intro Animation */}
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary"
          >
            <div className="text-center">
              {/* Logo Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto">
                  <Sparkles size={48} className="text-brand-primary" />
                </div>
              </motion.div>

              {/* App Name */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-bold text-white mb-2"
              >
                BiteDash
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-white/90"
              >
                Your Workplace Dining Experience
              </motion.p>

              {/* Loading Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-12"
              >
                <div className="flex space-x-2 justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-3 h-3 bg-white rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Location Selector */}
        {showSelector && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen py-8 px-4"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4"
              >
                <MapPin size={36} className="text-white" />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                Welcome to BiteDash!
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 text-lg"
              >
                Let's set up your location to start ordering
              </motion.p>
            </div>

            {/* Location Selector */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <LocationSelector onComplete={handleLocationComplete} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Welcome;
