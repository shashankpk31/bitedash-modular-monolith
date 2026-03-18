import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabs from '../components/navigation/BottomTabs';

/**
 * MobileLayout - Layout wrapper for mobile screens with bottom navigation
 *
 * Features:
 * - Fixed bottom navigation (BottomTabs)
 * - Safe area padding for iOS notch/home indicator
 * - Scrollable content area
 * - Pull-to-refresh ready
 */
const MobileLayout = ({ tabs, role = 'employee' }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-16">
      {/* Main content area - scrollable */}
      <main className="h-full overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom navigation - fixed */}
      <BottomTabs tabs={tabs} role={role} />
    </div>
  );
};

export default MobileLayout;
