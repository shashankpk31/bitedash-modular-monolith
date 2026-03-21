import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

// Install Prompt - PWA install prompt for mobile devices
// Why? Encourage users to install the app for better experience
const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show our custom prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    // Track install event (optional)
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('pwa-install-dismissed', expiryDate.toISOString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-6 lg:bottom-6 lg:max-w-sm"
        >
          <div className="glass rounded-2xl p-4 shadow-ambient border border-outline-variant/20">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 flex-shrink-0 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
                <Download size={24} className="text-on-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-headline text-body-lg text-on-surface mb-1">
                  Install BiteDash
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-3">
                  Install our app for faster access and better experience
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleInstall}
                  >
                    Install
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                  >
                    Not now
                  </Button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-surface-container transition-colors"
                aria-label="Dismiss"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
