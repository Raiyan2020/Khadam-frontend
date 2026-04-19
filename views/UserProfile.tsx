import React from 'react';
import { Settings as SettingsIcon, LogOut, HelpCircle, Edit, User, RefreshCw, CheckCircle } from 'lucide-react';
import { GlassCard, Button, Avatar } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { UserRole } from '../types';

import { useNavigate } from '@tanstack/react-router';
import { useUserRole } from '../UserRoleContext';
import verified from '@/assets/verified.png'

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, handleToggleRole } = useUserRole();
  const { t } = useLanguage();
  const isSeeker = userRole === UserRole.SEEKER;

  return (
    <div className="pb-10">
      {/* Profile Header */}
      <div className="relative pt-10 px-5 mb-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar src={isSeeker ? "https://picsum.photos/seed/user/200/200" : "https://picsum.photos/seed/office1/200/200"} alt="User" size="xl" className="border-4 border-background" />
            {!isSeeker && (
              <img src={verified} alt="Verified" className="absolute bottom-1 start-1 w-6 h-6" />
            )}
            <button
              className="absolute bottom-0 end-0 bg-accent text-accent-fg rounded-full p-1.5 border-4 border-background hover:scale-105 transition-transform"
              onClick={() => navigate({ to: '/edit-profile' })}
            >
              <Edit size={14} />
            </button>
          </div>
          <h1 className="text-xl font-bold text-primary mt-4">{isSeeker ? "Guest User" : "Al-Nour Recruitment"}</h1>
          <p className="text-sm text-secondary">{isSeeker ? "+965 1234 5678" : "+965 9876 5432"}</p>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {/* Role Switcher Demo */}
        <GlassCard onClick={handleToggleRole} className="flex items-center gap-4 !py-4 hover:bg-glassHigh active:scale-[0.99] transition-all bg-accent/5 border-accent/20">
          <div className="text-accent">
            <RefreshCw size={20} />
          </div>
          <div className="flex-1">
            <span className="block font-bold text-sm text-primary">{t('switch_role')}</span>
            <span className="text-xs text-secondary">{t(isSeeker ? 'role_seeker' : 'role_office')}</span>
          </div>
        </GlassCard>


        <MenuButton icon={<User size={20} />} label={t('edit_profile')} onClick={() => navigate({ to: '/edit-profile' })} />
        <MenuButton icon={<SettingsIcon size={20} />} label={t('settings')} onClick={() => navigate({ to: '/settings' })} />
        <MenuButton icon={<HelpCircle size={20} />} label={t('help_support')} onClick={() => navigate({ to: '/help-support' })} />
        <div className="pt-4">
          <MenuButton icon={<LogOut size={20} />} label={t('logout')} danger onClick={() => navigate({ to: '/login' })} />
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