import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import AnimatedPhoneMockup from '../../../components/animations/AnimatedPhoneMockup';
import { LOCL_STRG_KEY, ROLES } from '../../../config/constants';

/**
 * Modern Landing Page - PWA Focused
 * Based on: landing_page_visitor stitch design
 * REPLACEMENT for: LandingPage.jsx (old version)
 * BETTER: PWA install prompt, modern hero, features showcase
 */

const LandingPageNew = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem(LOCL_STRG_KEY.TOKEN);
    const storedUser = localStorage.getItem(LOCL_STRG_KEY.USER);

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const routes = {
          [ROLES.SUPER_ADMIN]: '/admin/dashboard',
          [ROLES.ORG_ADMIN]: '/org-admin/dashboard',
          [ROLES.VENDOR]: '/vendor/dashboard',
          [ROLES.EMPLOYEE]: '/employee/menu',
        };
        navigate(routes[user.role] || '/');
      } catch (e) {
        localStorage.clear();
      }
    }

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });
  }, [navigate]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-light/80 backdrop-blur-md dark:bg-background-dark/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Icon name="restaurant" size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">BiteDash</h2>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#solutions">Solutions</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#vendors">Vendors</a>
            </nav>

            <div className="flex items-center gap-3">
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="hidden md:flex h-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-semibold transition hover:bg-slate-200"
                >
                  <Icon name="download" size={16} className="mr-2" />
                  Install App
                </button>
              )}
              <button
                onClick={() => navigate('/login')}
                className="flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-5 text-sm font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 shadow-sm"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-8">
              <div className="space-y-4">
                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  Next-Gen PWA Technology
                </span>
                <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
                  Delicious Corporate Dining, <span className="text-primary">Zero Install</span> Required.
                </h1>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  Experience BiteDash's high-performance PWA: lightning-fast speeds, offline access, and zero storage space needed. Just pin to your home screen and go.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="flex h-14 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                >
                  <Icon name="install_mobile" />
                  Get Started
                </button>
                <button className="flex h-14 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-bold shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50">
                  <Icon name="play_circle" />
                  Watch Demo
                </button>
              </div>

              <div className="flex flex-wrap gap-6 border-t border-primary/10 pt-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-primary">0 sec</span>
                  <span className="text-sm font-medium text-slate-500">Install Time</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-primary">100%</span>
                  <span className="text-sm font-medium text-slate-500">Offline Access</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-primary">0 MB</span>
                  <span className="text-sm font-medium text-slate-500">Storage Used</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative hidden lg:flex items-center justify-center">
              <AnimatedPhoneMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose BiteDash?</h2>
            <p className="text-slate-600 dark:text-slate-400">Modern food ordering for modern workplaces</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'zap', title: 'Lightning Fast', desc: 'Order in under 2 minutes' },
              { icon: 'wifi_off', title: 'Works Offline', desc: 'Browse menus without internet' },
              { icon: 'qr_code', title: 'QR Pickup', desc: 'No waiting in line' },
              { icon: 'wallet', title: 'Digital Wallet', desc: 'Cashless payments' },
              { icon: 'bell', title: 'Real-time Updates', desc: 'Know when your order is ready' },
              { icon: 'smartphone', title: 'Any Device', desc: 'Phone, tablet, or desktop' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:shadow-lg transition-shadow"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name={feature.icon} size={24} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-16 bg-gradient-to-br from-primary/5 to-orange-50 dark:from-primary/10 dark:to-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-4">
              Solutions for Everyone
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Every Role</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From employees to vendors to administrators, BiteDash streamlines corporate dining for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Employees */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="users" size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Employees</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Browse menus from multiple vendors</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pre-order and skip the queue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track order status in real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Manage wallet balance easily</span>
                </li>
              </ul>
            </motion.div>

            {/* For Vendors */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-primary"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="store" size={32} className="text-primary" />
              </div>
              <div className="inline-block bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-4">For Vendors</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Receive orders digitally</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Manage menu in real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track sales and revenue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Reduce paper and errors</span>
                </li>
              </ul>
            </motion.div>

            {/* For Admins */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="settings" size={32} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Admins</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Manage multiple locations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Approve vendors and employees</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View analytics and reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Control wallet policies</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vendors Section */}
      <section id="vendors" className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-4">
              Vendor Benefits
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Grow Your Food Business</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join BiteDash and reach thousands of hungry employees at corporate campuses
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Features List */}
            <div className="space-y-6">
              {[
                {
                  icon: 'trending_up',
                  title: 'Increase Revenue',
                  desc: 'Reach more customers with pre-orders and reduce wait times'
                },
                {
                  icon: 'smartphone',
                  title: 'Go Digital',
                  desc: 'Manage your menu, orders, and inventory from any device'
                },
                {
                  icon: 'payments',
                  title: 'Instant Payments',
                  desc: 'Get paid directly to your account, no cash handling'
                },
                {
                  icon: 'bar_chart',
                  title: 'Analytics Dashboard',
                  desc: 'Track your best-selling items and peak hours'
                },
                {
                  icon: 'users',
                  title: 'Customer Insights',
                  desc: 'Understand customer preferences and ratings'
                },
                {
                  icon: 'headphones',
                  title: '24/7 Support',
                  desc: 'Dedicated support team to help you succeed'
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name={feature.icon} size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary to-orange-600 p-12 rounded-3xl text-white"
            >
              <h3 className="text-2xl font-bold mb-8">Vendor Success Stories</h3>
              <div className="space-y-8">
                <div>
                  <div className="text-5xl font-black mb-2">50+</div>
                  <div className="text-white/80">Active Vendors</div>
                </div>
                <div>
                  <div className="text-5xl font-black mb-2">10K+</div>
                  <div className="text-white/80">Orders Per Day</div>
                </div>
                <div>
                  <div className="text-5xl font-black mb-2">4.8★</div>
                  <div className="text-white/80">Average Rating</div>
                </div>
                <div>
                  <div className="text-5xl font-black mb-2">95%</div>
                  <div className="text-white/80">Vendor Satisfaction</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/register?role=vendor')}
                className="mt-8 w-full bg-white text-primary px-6 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition"
              >
                Become a Vendor
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Cafeteria?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Join thousands of employees enjoying delicious food at work
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('/register')} className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition">
              Sign Up Free
            </button>
            <button className="bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p>© 2024 BiteDash. Built with ❤️ for corporate dining.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageNew;
