import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import toast from 'react-hot-toast';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('bitedash_install_dismissed');
    if (dismissed) {
      return;
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after 2 minutes
      setTimeout(() => {
        setShowPrompt(true);
      }, 120000); // 2 minutes
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show after 2 minutes if not installed
    if (ios) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 120000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
      setShowPrompt(false);
      setDeferredPrompt(null);
    } else {
      toast.error('Installation cancelled');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('bitedash_install_dismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Download size={36} className="text-white" />
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Install BiteDash
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Get the full app experience with offline access, faster loading, and easy access from your home screen.
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <span className="text-gray-700 text-sm ml-3">Works offline</span>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <span className="text-gray-700 text-sm ml-3">Faster loading</span>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <span className="text-gray-700 text-sm ml-3">Push notifications</span>
          </div>
        </div>

        {/* iOS Instructions */}
        {isIOS ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
            <p className="text-blue-900 text-sm font-semibold mb-2 flex items-center">
              <Share size={16} className="mr-2" />
              To install on iOS:
            </p>
            <ol className="text-blue-800 text-sm space-y-1 ml-6 list-decimal">
              <li>Tap the Share button</li>
              <li>Scroll and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        ) : (
          /* Android Install Button */
          <button
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all mb-3"
          >
            Install App
          </button>
        )}

        {/* Later Button */}
        <button
          onClick={() => setShowPrompt(false)}
          className="w-full text-gray-600 py-3 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
