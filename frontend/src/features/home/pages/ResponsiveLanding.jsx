import { useState, useEffect } from 'react';
import CarouselLanding from './CarouselLanding';
import LandingPageNew from './LandingPageNew';

/**
 * Responsive Landing Page Wrapper
 * Shows Carousel for mobile screens (< 768px)
 * Shows Full Landing Page for tablet/desktop (>= 768px)
 */
const ResponsiveLanding = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile ? <CarouselLanding /> : <LandingPageNew />;
};

export default ResponsiveLanding;
