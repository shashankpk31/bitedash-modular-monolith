import React from 'react';
import { motion } from 'framer-motion';

/**
 * FadeIn - Smooth fade-in animation wrapper
 *
 * Usage:
 * <FadeIn>
 *   <YourComponent />
 * </FadeIn>
 */
const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up', // 'up', 'down', 'left', 'right', 'none'
  distance = 20,
  className = '',
}) => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const initial = {
    opacity: 0,
    ...directions[direction],
  };

  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Smooth easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
