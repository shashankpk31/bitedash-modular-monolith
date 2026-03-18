import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Icon from '../ui/Icon';

/**
 * PullToRefresh - Mobile pull-to-refresh interaction
 *
 * Usage:
 * <PullToRefresh onRefresh={async () => { await fetchData(); }}>
 *   <YourContent />
 * </PullToRefresh>
 */
const PullToRefresh = ({ children, onRefresh, threshold = 80 }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const y = useMotionValue(0);

  // Transform pull distance to rotation (for spinner animation)
  const rotate = useTransform(y, [0, threshold], [0, 180]);
  const opacity = useTransform(y, [0, threshold / 2, threshold], [0, 0.5, 1]);

  const handleDragEnd = async (event, info) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      y.set(threshold);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 -mt-20 z-10"
      >
        <motion.div style={{ rotate }} className="text-primary">
          {isRefreshing ? (
            <Icon name="sync" size={24} className="animate-spin" />
          ) : (
            <Icon name="arrow_downward" size={24} />
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
