import React, { useState, useEffect } from 'react';
import { Home, Heart, User, Building2, LayoutList, Inbox, Award, Plus } from 'lucide-react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { UserRole } from '../types';
import { useLanguage } from '../i18n';
import { useUserRole } from '../UserRoleContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, dir } = useLanguage();
  const { userRole } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  const isSeeker = userRole === UserRole.SEEKER;
  const hideNav = location.pathname === '/login' || location.pathname === '/sign-up' || location.pathname === '/verify-otp';

  const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/country') || location.pathname.startsWith('/search');
  const isProfileActive = location.pathname === '/profile' || location.pathname === '/settings';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => setIsFilterOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    document.addEventListener('filter-modal-change', handler);
    return () => document.removeEventListener('filter-modal-change', handler);
  }, []);

  return (
    <div className="w-full flex justify-center bg-[var(--bg-app)] transition-colors duration-300 overflow-hidden" style={{ height: 'var(--app-height, 100dvh)' }} dir={dir}>
      <div className="w-full max-w-[991px] bg-background relative flex flex-col shadow-2xl overflow-hidden sm:rounded-[28px] sm:border sm:border-border transition-colors duration-300" style={{ height: 'var(--app-height, 100dvh)' }}>
        <main className="flex-1 overflow-y-auto no-scrollbar relative pb-[calc(80px+env(safe-area-inset-bottom)+20px)] pt-[env(safe-area-inset-top)]">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none h-64" />
          {children}
        </main>

        {/* Bottom Navigation */}
        {!hideNav && !isFilterOpen && (
          <div className="shrink-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
            <div className={`grid ${isSeeker ? 'grid-cols-4' : 'grid-cols-5'} h-[80px] items-start pt-3 relative`}>
              <NavItem
                icon={<Home size={22} />}
                label={t('nav_home')}
                isActive={isHomeActive}
                onClick={() => navigate({ to: '/' })}
              />

              {isSeeker ? (
                <>
                  <NavItem
                    icon={<Heart size={22} />}
                    label={t('nav_saved')}
                    isActive={location.pathname === '/favorites'}
                    onClick={() => navigate({ to: '/favorites' })}
                  />
                  <NavItem
                    icon={<Building2 size={22} />}
                    label={t('nav_offices')}
                    isActive={location.pathname === '/offices'}
                    onClick={() => navigate({ to: '/offices' })}
                  />
                </>
              ) : (
                <>
                  <NavItem
                    icon={<LayoutList size={22} />}
                    label={t('nav_my_ads')}
                    isActive={location.pathname === '/my-ads'}
                    onClick={() => navigate({ to: '/my-ads' })}
                  />

                  {/* Central Add Ad Button */}
                  <div className="relative -top-7 flex justify-center">
                    <button
                      onClick={() => navigate({ to: '/publish-ad' } as any)}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-background"
                    >
                      <Plus size={28} strokeWidth={3} />
                    </button>
                  </div>

                  <NavItem
                    icon={<Award size={22} />}
                    label={t('nav_subscriptions') || 'Subscriptions'}
                    isActive={location.pathname === '/subscriptions'}
                    onClick={() => navigate({ to: '/subscriptions' })}
                  />
                </>
              )}

              <NavItem
                icon={<User size={22} />}
                label={t('nav_profile')}
                isActive={isProfileActive}
                onClick={() => navigate({ to: '/profile' })}
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