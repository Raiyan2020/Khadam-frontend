'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Heart, User, Building2, LayoutList, Inbox } from 'lucide-react';
import { UserRole } from '../types';
import { useLanguage } from '../i18n';
import { useUserRole } from '../UserRoleContext';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideNav }) => {
  const { t, dir } = useLanguage();
  const { userRole } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();

  const isSeeker = userRole === UserRole.SEEKER;

  const isActive = (...paths: string[]) => paths.some(p => pathname === p || pathname.startsWith(p + '/'));

  return (
    <div className="h-screen w-full flex justify-center bg-[var(--bg-app)] transition-colors duration-300 overflow-hidden" dir={dir}>
      {/* App Shell Container */}
      <div className="w-full max-w-[991px] bg-background relative flex flex-col h-[100dvh]  shadow-2xl overflow-hidden sm:rounded-[28px]  sm:border sm:border-border transition-colors duration-300">

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative pb-[calc(80px+env(safe-area-inset-bottom)+20px)]">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none h-64" />
          {children}
        </main>

        {/* Bottom Navigation */}
        {!hideNav && (
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
            <div className="grid grid-cols-4 h-[80px] items-start pt-3">
              <NavItem
                icon={<Home size={22} />}
                label={t('nav_home')}
                isActive={isActive('/', '/country', '/search')}
                onClick={() => router.push('/')}
              />

              {isSeeker ? (
                <>
                  <NavItem
                    icon={<Heart size={22} />}
                    label={t('nav_saved')}
                    isActive={isActive('/favorites')}
                    onClick={() => router.push('/favorites')}
                  />
                  <NavItem
                    icon={<Building2 size={22} />}
                    label={t('nav_offices')}
                    isActive={isActive('/offices')}
                    onClick={() => router.push('/offices')}
                  />
                </>
              ) : (
                <>
                  <NavItem
                    icon={<LayoutList size={22} />}
                    label={t('nav_my_ads')}
                    isActive={isActive('/my-ads')}
                    onClick={() => router.push('/my-ads')}
                  />
                  <NavItem
                    icon={<Inbox size={22} />}
                    label={t('nav_leads')}
                    isActive={isActive('/leads')}
                    onClick={() => router.push('/leads')}
                  />
                </>
              )}

              <NavItem
                icon={<User size={22} />}
                label={t('nav_profile')}
                isActive={isActive('/profile', '/settings')}
                onClick={() => router.push('/profile')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 w-full transition-colors duration-200 ${isActive ? 'text-accent-text' : 'text-secondary hover:text-primary'}`}
  >
    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-accent-subtle shadow-[0_0_15px_rgba(var(--brand-rgb),0.2)] scale-110' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold leading-none ${isActive ? 'text-accent-text' : ''}`}>{label}</span>
  </button>
);