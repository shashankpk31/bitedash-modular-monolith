import { useEffect, useRef, useState } from 'react';

/**
 * Hook for implementing pull-to-refresh on mobile
 * @param {Function} onRefresh - Callback function to execute on refresh
 * @param {Object} options - Configuration options
 * @returns {Object} - State and ref for the refresh component
 */
const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 80, // Minimum pull distance to trigger refresh
    resistance = 2.5, // How much to slow down the pull (higher = slower)
    enabled = true, // Enable/disable the hook
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Only enable on touch devices
    if (!('ontouchstart' in window)) return;

    const handleTouchStart = (e) => {
      // Only start if at the top of the page
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      // Only pull down
      if (distance > 0) {
        // Prevent default scroll behavior
        e.preventDefault();

        // Apply resistance
        const adjustedDistance = distance / resistance;
        setPullDistance(adjustedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging.current) return;

      isDragging.current = false;

      // Trigger refresh if pulled far enough
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        setPullDistance(threshold); // Keep at threshold during refresh

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isRefreshing, pullDistance, threshold, resistance, onRefresh]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    threshold,
  };
};

export default usePullToRefresh;
