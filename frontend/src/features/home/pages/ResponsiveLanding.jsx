import { useEffect, useState } from 'react';
import LandingPage from './LandingPage';
import CarouselLanding from './CarouselLanding';

// Responsive Landing - Shows different landing pages based on screen size
// Why? Mobile users get swipeable carousel, desktop users get full landing page
const ResponsiveLanding = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <CarouselLanding /> : <LandingPage />;
};

export default ResponsiveLanding;
