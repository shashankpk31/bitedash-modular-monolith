import { motion } from "framer-motion";
import { Utensils, Zap, ShieldCheck } from "lucide-react";

const HeroContent = ({ onAction }) => {
  const features = [
    { icon: <Zap className="text-brand-primary" size={18} />, text: "Zero Wait" },
    { icon: <Utensils className="text-brand-primary" size={18} />, text: "Multi-Vendor" },
    { icon: <ShieldCheck className="text-brand-primary" size={18} />, text: "Secure Pay" },
  ];

  return (
    <div className="flex flex-col text-left space-y-4 sm:space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4 sm:space-y-5"
      >
        <span className="inline-block bg-cream-100 text-brand-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase">
          Corporate Dining
        </span>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
          Fuel your <span className="text-brand-primary">Workday</span> with one tap
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
          Modern workplace dining solution for employees and vendors.
        </p>

        {}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2 bg-white shadow-sm border border-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg">
              {f.icon}
              <span className="text-xs sm:text-sm font-medium text-gray-700">{f.text}</span>
            </div>
          ))}
        </div>

        {}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
          <button
            onClick={onAction}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-cream-200 transition-all active:scale-95 min-h-[44px] touch-manipulation"
          >
            Get Started Now
          </button>

          <button
             onClick={onAction}
             className="bg-white border-2 border-gray-200 hover:border-brand-primary hover:text-brand-primary text-gray-700 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all min-h-[44px] touch-manipulation"
          >
            View Demo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroContent;