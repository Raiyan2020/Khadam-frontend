import React from 'react';
import { Settings as SettingsIcon, LogOut, HelpCircle, Edit, User, RefreshCw, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { GlassCard, Button, Avatar } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { UserRole } from '../types';

import { useNavigate } from '@tanstack/react-router';
import { useUserRole } from '../UserRoleContext';
import verified from '@/assets/verified.png'
import { useLogout } from '../features/auth/hooks/useLogout';
import { useProfile } from '../features/auth/hooks/useProfile';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useUserRole();
  const { t } = useLanguage();
  const { data: profile, isLoading } = useProfile();
  const logoutMutation = useLogout();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  const isCompany = profile?.type === '2';

  return (
    <div className="pb-10">
      {/* Profile Header */}
      <div className="relative pt-10 px-4 mb-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar
              src={profile?.image || (userRole === UserRole.SEEKER ? "https://picsum.photos/seed/user/200/200" : "https://picsum.photos/seed/office1/200/200")}
              alt={profile?.name || "User"}
              size="xl"
              className="border-4 border-background"
            />
            {isCompany && (
              <img src={verified} alt="Verified" className="absolute bottom-1 start-1 w-6 h-6" />
            )}
            <button
              className="absolute bottom-0 end-0 bg-accent text-accent-fg rounded-full p-1.5 border-4 border-background hover:scale-105 transition-transform"
              onClick={() => navigate({ to: '/edit-profile' })}
            >
              <Edit size={14} />
            </button>
          </div>
          <h1 className="text-xl font-bold text-primary mt-4">{profile?.name || (userRole === UserRole.SEEKER ? "Guest User" : "Al-Nour Recruitment")}</h1>
          <p className="text-sm text-secondary" dir="ltr">{profile?.phone}</p>
        </div>
      </div>

      <div className="px-4 space-y-3">
        <MenuButton icon={<User size={20} />} label={t('edit_profile')} onClick={() => navigate({ to: '/edit-profile' })} />
        <MenuButton icon={<SettingsIcon size={20} />} label={t('settings')} onClick={() => navigate({ to: '/settings' })} />
        <MenuButton icon={<HelpCircle size={20} />} label={t('help_support')} onClick={() => navigate({ to: '/help-support' })} />
        <MenuButton icon={<FileText size={20} />} label={t('terms_conditions')} onClick={() => navigate({ to: '/terms' })} />
        <div className="pt-4">
          <MenuButton
            icon={logoutMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
            label={logoutMutation.isPending ? t('loading') || 'Loading...' : t('logout')}
            danger
            onClick={() => logoutMutation.mutate()}
          />
        </div>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean }> = ({ icon, label, onClick, danger }) => (
  <GlassCard onClick={onClick} className="flex items-center gap-4 !py-4 hover:bg-glassHigh active:scale-[0.99] transition-all">
    <div className={`text-${danger ? 'red-500' : 'secondary'}`}>
      {icon}
    </div>
    <span className={`flex-1 font-medium ${danger ? 'text-red-500' : 'text-primary'}`}>{label}</span>
  </GlassCard>
);