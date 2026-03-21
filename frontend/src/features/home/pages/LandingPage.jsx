import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Utensils,
  Smartphone,
  Zap,
  Shield,
  Download,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../../contexts';
import Button from '../../../common/components/Button';

// Modern Landing Page following "The Appetizing Editorial" design system
// Hybrid of PWA features + responsive design
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = {
        ROLE_SUPER_ADMIN: '/admin/dashboard',
        ROLE_ORG_ADMIN: '/org-admin/dashboard',
        ROLE_VENDOR: '/vendor/dashboard',
        ROLE_EMPLOYEE: '/employee/menu',
      };
      navigate(roleRoutes[user.role] || '/');
    }
  }, [isAuthenticated, user, navigate]);

  // PWA install prompt handling
  // Why? Allows users to install app for native-like experience
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  // Animation variants for Framer Motion
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Header - Glassmorphism on scroll */}
      <header className="sticky top-0 z-50 glass border-b border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-primary">
                <img src="/logo.svg" alt="BiteDash" className="w-10 h-10" />
              </div>
              <h1 className="font-headline text-headline-sm text-on-surface">
                BiteDash
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-label-md text-on-surface hover:text-primary transition-colors">
                Features
              </a>
              <a href="#solutions" className="text-label-md text-on-surface hover:text-primary transition-colors">
                Solutions
              </a>
              <a href="#vendors" className="text-label-md text-on-surface hover:text-primary transition-colors">
                For Vendors
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="hidden md:flex items-center gap-2 px-4 h-10 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-label-md text-on-surface"
                >
                  <Download size={16} />
                  Install App
                </button>
              )}
              <Button variant="outline" size="md" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-primary/5 to-transparent rounded-l-[4rem] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-label-sm text-on-secondary-container font-semibold uppercase tracking-wider">
                  Next-Gen Corporate Dining
                </span>

                <h1 className="font-headline text-display-lg text-on-surface leading-tight">
                  Delicious Food,{' '}
                  <span className="text-primary">Zero Wait Time</span>
                </h1>

                <p className="text-body-lg text-on-surface-variant max-w-xl">
                  Experience BiteDash's lightning-fast PWA. Order from your workplace cafeteria,
                  track in real-time, and enjoy hassle-free payments. Available on any device,
                  no app store required.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                >
                  Start Ordering
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={<PlayCircle size={20} />}
                >
                  Watch Demo
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-8 pt-8 border-t border-outline-variant/15">
                <div>
                  <div className="font-headline text-headline-lg text-primary">0 sec</div>
                  <div className="text-label-md text-on-surface-variant uppercase">Install Time</div>
                </div>
                <div>
                  <div className="font-headline text-headline-lg text-primary">100%</div>
                  <div className="text-label-md text-on-surface-variant uppercase">Offline Ready</div>
                </div>
                <div>
                  <div className="font-headline text-headline-lg text-primary">0 MB</div>
                  <div className="text-label-md text-on-surface-variant uppercase">Storage Used</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Visual/Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 bg-surface-container-lowest rounded-2xl p-8 shadow-ambient-lg">
                {/* Food image placeholder */}
                <div className="aspect-food rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <img src="/logo.svg" alt="BiteDash Food" className="w-32 h-32 opacity-60" />
                </div>

                {/* Floating card - sample menu item */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-4 -right-4 bg-surface-container-lowest rounded-xl p-4 shadow-ambient max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container" />
                    <div className="flex-1">
                      <div className="font-headline text-body-lg text-on-surface">Grilled Paneer Wrap</div>
                      <div className="text-label-sm text-on-surface-variant">Ready in 10 min</div>
                    </div>
                    <div className="font-headline text-headline-sm text-primary">₹120</div>
                  </div>
                </motion.div>
              </div>

              {/* Background circle decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="font-headline text-display-md text-on-surface">
              Why Choose BiteDash?
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Everything you need for seamless corporate dining, powered by modern PWA technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-ambient transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-headline text-headline-sm text-on-surface mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="font-headline text-display-md text-on-surface">
              Ready to Transform Your Dining Experience?
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Join thousands of employees, vendors, and organizations already using BiteDash
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              variant="primary"
              size="xl"
              onClick={() => navigate('/register')}
            >
              Get Started Now
            </Button>
            <Button
              variant="secondary"
              size="xl"
              onClick={() => navigate('/login')}
            >
              Login to Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/15 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <img src="/logo.svg" alt="BiteDash" className="w-8 h-8" />
              </div>
              <span className="font-headline text-body-lg text-on-surface">BiteDash</span>
            </div>
            <p className="text-label-md text-on-surface-variant">
              © 2026 BiteDash. Fueling your workday.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Features data
const features = [
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: 'Lightning Fast',
    description: 'PWA technology means instant loading, no app store waits, and blazing-fast performance on any device.',
  },
  {
    icon: <Smartphone className="w-6 h-6 text-primary" />,
    title: 'Works Everywhere',
    description: 'Access from any browser on phone, tablet, or desktop. One app, all platforms, zero downloads.',
  },
  {
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: 'Real-Time Tracking',
    description: 'Know exactly when your order is ready with live status updates and notifications.',
  },
  {
    icon: <Wallet className="w-6 h-6 text-primary" />,
    title: 'Digital Wallet',
    description: 'Secure, hassle-free payments with your corporate wallet. No cash, no cards needed.',
  },
  {
    icon: <Shield className="w-6 h-6 text-primary" />,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and authentication keep your data and transactions safe.',
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: 'Multi-Vendor',
    description: 'Choose from multiple cafeterias and vendors in your campus. All in one place.',
  },
];

export default LandingPage;
