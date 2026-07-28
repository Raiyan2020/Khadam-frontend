import React from 'react';
import { useLanguage } from '../../../i18n';
import { Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../../../theme';
import { useNavigate } from '@tanstack/react-router';
import { LoginForm, LoginFormLinks } from './LoginForm';

/**
 * The full-page /login screen. The form itself lives in LoginForm, shared with
 * the guest-mode login popup.
 */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Top Switcher Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-50">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="w-8 h-8 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors flex-shrink-0 text-xs font-bold"
          title={language === 'ar' ? 'English' : 'العربية'}
          aria-label={language === 'ar' ? 'Switch to English' : 'تغيير إلى العربية'}
        >
          {language === 'ar' ? 'EN' : 'AR'}
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={() => {
            if (theme === 'light') setTheme('dark');
            else if (theme === 'dark') setTheme('system');
            else setTheme('light');
          }}
          className="w-8 h-8 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors flex-shrink-0"
          title={`${t('theme')}: ${t(`theme_${theme}`)}`}
          aria-label={t('theme')}
        >
          {theme === 'light' && <Sun size={16} />}
          {theme === 'dark' && <Moon size={16} />}
          {theme === 'system' && <Smartphone size={16} />}
        </button>
      </div>

      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-brand-500/20 to-transparent rounded-[100%] blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-glass border border-border rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-brand-500/10">
            <img
              src="https://raiyansoft.com/wp-content/uploads/2026/02/icon-s-d.png"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {t('sign_in') || 'Sign In'}
          </h1>
          <p className="text-sm text-secondary">
            {t('enter_phone_desc') || 'Enter your phone number to continue'}
          </p>
        </div>

        <LoginForm />

        <LoginFormLinks onNavigate={(to) => navigate({ to } as any)} />
      </div>
    </div>
  );
};
