import React from 'react';
import { motion } from 'framer-motion';

/**
 * StaggerList - Staggered animation for list items
 *
 * Usage:
 * <StaggerList>
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </StaggerList>
 */
const StaggerList = ({
  children,
  staggerDelay = 0.05,
  initialDelay = 0,
  direction = 'up',
  className = '',
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const itemVariants = {
    up: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -20 },
      show: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: 20 },
      show: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -20 },
      show: { opacity: 1, x: 0 },
    },
  };

  const item = itemVariants[direction];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

export default StaggerList;
