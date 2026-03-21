import { User, Mail, Phone, Building2, LogOut, Edit } from 'lucide-react';
import Button from '../../../common/components/Button';
import { useAuth } from '../../../contexts';
import { useLogout } from '../../../services/queries/auth.queries';
import { formatPhone } from '../../../common/utils';

// Profile Page - User profile and settings
// Why? Allows users to view their info and logout
const ProfilePage = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/15">
        <h1 className="font-headline text-display-sm text-on-surface">Profile</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-6">
        {/* User Avatar */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-primary">
            <User size={48} className="text-on-primary" />
          </div>
          <div>
            <h2 className="font-headline text-headline-lg text-on-surface">
              {user?.name || 'User'}
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              {user?.role?.replace('ROLE_', '').replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <h3 className="font-headline text-headline-sm text-on-surface">
            Account Information
          </h3>

          {/* Email */}
          {user?.email && (
            <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Mail size={20} className="text-on-surface-variant" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-label-sm text-on-surface-variant">Email</div>
                <div className="font-headline text-body-md text-on-surface">
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {/* Phone */}
          {user?.phone && (
            <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Phone size={20} className="text-on-surface-variant" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-label-sm text-on-surface-variant">Phone</div>
                <div className="font-headline text-body-md text-on-surface">
                  {formatPhone(user.phone)}
                </div>
              </div>
            </div>
          )}

          {/* Organization */}
          {user?.organizationName && (
            <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Building2 size={20} className="text-on-surface-variant" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-label-sm text-on-surface-variant">Organization</div>
                <div className="font-headline text-body-md text-on-surface">
                  {user.organizationName}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-6">
          {/* Logout */}
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<LogOut size={20} />}
            onClick={handleLogout}
            loading={logoutMutation.isPending}
            className="border-error text-error hover:bg-error/10"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
