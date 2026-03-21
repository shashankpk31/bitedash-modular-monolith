import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Mail, LogOut, Utensils } from 'lucide-react';
import Button from '../../../common/components/Button';
import { useAuth } from '../../../contexts';
import { useLogout } from '../../../services/queries/auth.queries';

// Pending Approval Page - shown when user account is awaiting approval
const PendingApprovalPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Redirect if user is already approved
  useEffect(() => {
    if (user && user.status === 'APPROVED') {
      const roleRoutes = {
        ROLE_SUPER_ADMIN: '/admin/dashboard',
        ROLE_ORG_ADMIN: '/org-admin/dashboard',
        ROLE_VENDOR: '/vendor/dashboard',
        ROLE_EMPLOYEE: '/employee/menu',
      };
      navigate(roleRoutes[user.role] || '/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get role-specific messaging
  const getRoleMessage = () => {
    switch (user?.role) {
      case 'ROLE_VENDOR':
        return {
          title: 'Vendor Account Under Review',
          description: 'Your vendor account is being reviewed by the organization administrator. You will receive an email notification once your account is approved.',
          timeline: 'This typically takes 1-2 business days.',
        };
      case 'ROLE_EMPLOYEE':
        return {
          title: 'Employee Account Under Review',
          description: 'Your employee account is being verified by your organization administrator. You will receive an email notification once your account is approved.',
          timeline: 'This typically takes a few hours.',
        };
      case 'ROLE_ORG_ADMIN':
        return {
          title: 'Organization Account Under Review',
          description: 'Your organization registration is being reviewed by our team. You will receive an email notification once your account is approved.',
          timeline: 'This typically takes 1-2 business days.',
        };
      default:
        return {
          title: 'Account Under Review',
          description: 'Your account is being reviewed by the appropriate administrator. You will receive an email notification once your account is approved.',
          timeline: 'This typically takes 1-2 business days.',
        };
    }
  };

  const roleMessage = getRoleMessage();

  // Timeline steps
  const steps = [
    {
      icon: CheckCircle,
      title: 'Registration Complete',
      description: 'You have successfully registered your account',
      status: 'completed',
    },
    {
      icon: Clock,
      title: 'Under Review',
      description: roleMessage.description,
      status: 'current',
    },
    {
      icon: Mail,
      title: 'Approval Notification',
      description: 'You will receive an email once approved',
      status: 'pending',
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-primary">
              <img src="/logo.svg" alt="BiteDash" className="w-10 h-10" />
            </div>
            <h1 className="font-headline text-headline-md text-on-surface">BiteDash</h1>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut size={16} />}
            onClick={handleLogout}
            loading={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>

        {/* Main card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient space-y-8">
          {/* Header with animation */}
          <div className="text-center space-y-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-20 h-20 mx-auto rounded-2xl bg-yellow-500/10 flex items-center justify-center"
            >
              <Clock size={40} className="text-yellow-600" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="font-headline text-display-sm text-on-surface">
                {roleMessage.title}
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-md mx-auto">
                {roleMessage.timeline}
              </p>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Name:</span>
                <span className="text-on-surface font-semibold">{user.name}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Email/Phone:</span>
                <span className="text-on-surface font-semibold">{user.email || user.phone}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Role:</span>
                <span className="text-on-surface font-semibold">
                  {user.role.replace('ROLE_', '').replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Status:</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-label-sm font-semibold">
                  <Clock size={14} />
                  Pending Approval
                </span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const isPending = step.status === 'pending';

              return (
                <div key={index} className="flex gap-4">
                  {/* Icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500/10'
                          : isCurrent
                          ? 'bg-yellow-500/10'
                          : 'bg-surface-container'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={
                          isCompleted
                            ? 'text-green-600'
                            : isCurrent
                            ? 'text-yellow-600'
                            : 'text-on-surface-variant'
                        }
                      />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          isCompleted ? 'bg-green-600' : 'bg-outline-variant'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <h3
                      className={`font-headline text-body-lg ${
                        isCompleted || isCurrent ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help section */}
          <div className="pt-6 border-t border-outline-variant/15 space-y-3">
            <h3 className="font-headline text-headline-sm text-on-surface">
              What happens next?
            </h3>
            <ul className="space-y-2 text-body-md text-on-surface-variant">
              <li className="flex gap-2">
                <span>•</span>
                <span>Your account details are being verified by the administrator</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>You will receive an email notification once approved</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>You can then login and start using BiteDash</span>
              </li>
            </ul>
          </div>

          {/* Contact support */}
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <p className="text-body-md text-on-surface">
              Need help?{' '}
              <a
                href="mailto:support@bitedash.com"
                className="text-primary hover:text-primary-dim font-semibold transition-colors"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApprovalPage;
