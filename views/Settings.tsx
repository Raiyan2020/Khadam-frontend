
import React from 'react';
import { ArrowLeft, ArrowRight, Globe, Check, Moon, Sun, Smartphone } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useTheme, Theme } from '../theme';
import { GlassCard } from '../components/GlassUI';

import { useNavigate } from '@tanstack/react-router';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, setTheme } = useTheme();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-8 mb-6">
        <button 
          onClick={() => navigate({ to: '/profile' })} 
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
        >
          <BackIcon size={20} />
        </button>
        <h1 className="text-xl font-bold text-primary">{t('settings_title')}</h1>
      </div>

      <div className="px-5 space-y-8">
        {/* Language Section */}
        <section>
          <h2 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">{t('language')}</h2>
          <GlassCard className="!p-0 overflow-hidden">
            <LanguageOption 
              active={language === 'en'} 
              onClick={() => setLanguage('en')} 
              icon={<div className="text-xs font-bold">EN</div>}
              label="English"
              iconColor="bg-blue-500/20 text-blue-400"
            />
            <div className="h-[1px] bg-border mx-4" />
            <LanguageOption 
              active={language === 'ar'} 
              onClick={() => setLanguage('ar')} 
              icon={<div className="text-xs font-bold">AR</div>}
              label="العربية"
              iconColor="bg-green-500/20 text-green-400"
            />
          </GlassCard>
        </section>

        {/* Theme Section */}
        <section>
          <h2 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">{t('theme')}</h2>
          <GlassCard className="!p-0 overflow-hidden">
             <ThemeOption 
                active={theme === 'dark'} 
                onClick={() => setTheme('dark')}
                icon={<Moon size={16} />}
                label={t('theme_dark')}
             />
             <div className="h-[1px] bg-border mx-4" />
             <ThemeOption 
                active={theme === 'light'} 
                onClick={() => setTheme('light')}
                icon={<Sun size={16} />}
                label={t('theme_light')}
             />
             <div className="h-[1px] bg-border mx-4" />
             <ThemeOption 
                active={theme === 'system'} 
                onClick={() => setTheme('system')}
                icon={<Smartphone size={16} />}
                label={t('theme_system')}
             />
          </GlassCard>
        </section>
      </div>
    </div>
  );
};

const LanguageOption: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; iconColor: string; fontClass?: string }> = ({ active, onClick, icon, label, iconColor }) => (
  <div 
    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-glassHigh transition-colors ${active ? 'bg-accent-subtle/50' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
         {icon}
       </div>
       <span className={`text-primary font-medium`}>{label}</span>
    </div>
    {active && <Check size={18} className="text-brand-500" />}
  </div>
);

const ThemeOption: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <div 
    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-glassHigh transition-colors ${active ? 'bg-accent-subtle/50' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
       <div className="text-secondary">
         {icon}
       </div>
       <span className="text-primary font-medium">{label}</span>
    </div>
    {active && <Check size={18} className="text-brand-500" />}
  </div>
);
