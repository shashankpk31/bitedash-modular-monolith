import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneMockup from "../../../components/ui/PhoneMockup";
import RegisterForm from "../../auth/components/RegisterForm";
import LoginForm from "../../auth/components/LoginForm";
import AccountVerifyForm from "../../auth/components/AccountVerifyForm"; 
import HeroContent from "../components/HeroContent";
import { useNavigate } from "react-router-dom";
import { LOCL_STRG_KEY, ROLES, LANDING_PAGE_VIEW } from "../../../config/constants";
import { scaleAnimation, fadeAnimation } from "../../../config/animations";

const LandingPage = () => {
  const [view, setView] = useState(LANDING_PAGE_VIEW.HOME);
  const [pendingIdentifier, setPendingIdentifier] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(LOCL_STRG_KEY.TOKEN);
    const storedUser = localStorage.getItem(LOCL_STRG_KEY.USER);

    if (token && storedUser && window.location.pathname === "/") {
      try {
        const user = JSON.parse(storedUser);
        const routes = {
          [ROLES.SUPER_ADMIN]: "/admin/dashboard",
          [ROLES.ORG_ADMIN]: "/org-admin/dashboard",
          [ROLES.VENDOR]: "/vendor/dashboard",
          [ROLES.EMPLOYEE]: "/home",
        };

        const targetPath = routes[user.role] || "/";
        navigate(targetPath, { replace: true });
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleRegistrationSuccess = (identifier) => {
    setPendingIdentifier(identifier);
    setView(LANDING_PAGE_VIEW.ACC_VERIFY);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cream-50 via-white to-cream-100 flex flex-col safe-area-insets">
      {}
      <nav className="flex justify-between items-center p-4 sm:p-6 bg-transparent w-full z-50 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setView(LANDING_PAGE_VIEW.HOME)}
        >
          <img src="/logo.svg" alt="BiteDash" className="h-10 w-10 sm:h-12 sm:w-12" />
          <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">
            BiteDash
          </h1>
        </motion.div>

        <div className="flex items-center space-x-3 sm:space-x-6">
          <button
            onClick={() => setView(LANDING_PAGE_VIEW.LOGIN)}
            className="text-gray-700 font-semibold hover:text-brand-primary transition-colors text-sm sm:text-base min-h-[44px] px-3 touch-manipulation"
          >
            Login
          </button>
          <button
            onClick={() => setView(LANDING_PAGE_VIEW.REGISTER)}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold shadow-lg shadow-cream-200 transition-all active:scale-95 text-sm sm:text-base min-h-[44px] touch-manipulation"
          >
            <span className="hidden sm:inline">Join Now</span>
            <span className="sm:hidden">Join</span>
          </button>
        </div>
      </nav>

      {}
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between flex-1 px-4 sm:px-6 py-4 sm:py-8 lg:py-0 gap-6 lg:gap-12 overflow-y-auto lg:overflow-hidden">
        {}
        <div className="hidden lg:flex lg:w-1/2 justify-center items-center h-full">
          <PhoneMockup />
        </div>

        {}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="w-full max-w-md bg-white/40 backdrop-blur-sm p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
            <AnimatePresence mode="wait">
              {}
              {view === LANDING_PAGE_VIEW.HOME && (
                <motion.div
                  key={LANDING_PAGE_VIEW.HOME}
                  {...fadeAnimation}
                >
                  <HeroContent onAction={() => setView(LANDING_PAGE_VIEW.REGISTER)} />
                </motion.div>
              )}

              {}
              {view === LANDING_PAGE_VIEW.REGISTER && (
                <motion.div
                  key={LANDING_PAGE_VIEW.REGISTER}
                  {...scaleAnimation}
                >
                  <RegisterForm
                    onSwitchToLogin={() => setView(LANDING_PAGE_VIEW.LOGIN)}
                    onBack={() => setView(LANDING_PAGE_VIEW.HOME)}
                    onSuccess={handleRegistrationSuccess}
                  />
                </motion.div>
              )}

              {}
              {view === LANDING_PAGE_VIEW.ACC_VERIFY && (
                <motion.div
                  key={LANDING_PAGE_VIEW.ACC_VERIFY}
                  {...scaleAnimation}
                >
                  <AccountVerifyForm
                    identifier={pendingIdentifier}
                    onSuccess={() => setView(LANDING_PAGE_VIEW.LOGIN)}
                    onBack={() => setView(LANDING_PAGE_VIEW.REGISTER)}
                  />
                </motion.div>
              )}

              {}
              {view === LANDING_PAGE_VIEW.LOGIN && (
                <motion.div
                  key={LANDING_PAGE_VIEW.LOGIN}
                  {...scaleAnimation}
                >
                  <LoginForm
                    onSwitchToRegister={() => setView(LANDING_PAGE_VIEW.REGISTER)}
                    onBack={() => setView(LANDING_PAGE_VIEW.HOME)}
                    onUnverified={(identifier) => {
                      setPendingIdentifier(identifier);
                      setView(LANDING_PAGE_VIEW.ACC_VERIFY);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;