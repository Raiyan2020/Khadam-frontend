import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../../../components/GlassUI';
import { useLanguage } from '../../../i18n';
import { Loader2, Eye, EyeOff, Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../../../theme';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useNewPassword } from '../hooks/useNewPassword';
import { z } from 'zod';
import { toast } from 'sonner';

export const NewPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const search = useSearch({ from: '/new-password' }) as { phone?: string; country_id?: number };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPasswordMutation = useNewPassword();

  useEffect(() => {
    if (!search.phone) {
      navigate({ to: '/forgot-password' });
    }
  }, [search.phone, navigate]);

  const schema = z
    .object({
      password: z.string().min(8, t('password_min_length') || 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, t('password_required') || 'Password is required'),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('passwords_not_match') || 'Passwords do not match',
      path: ['confirmPassword'],
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      schema.parse({ password, confirmPassword });
      newPasswordMutation.mutate({
        phone: search.phone!,
        country_id: search.country_id ?? 1,
        password,
        password_confirmation: confirmPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    }
  };

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
            {t('new_password') || 'New Password'}
          </h1>
          <p className="text-sm text-secondary">
            {t('new_password_desc') || 'Create a new password for your account'}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {t('password') || 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password_placeholder') || '••••••••'}
                  className="w-full h-12 px-4 pe-12 rounded-xl bg-glass border border-border text-primary placeholder:text-secondary text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-secondary hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {t('confirm_password') || 'Confirm Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('password_placeholder') || '••••••••'}
                  className="w-full h-12 px-4 pe-12 rounded-xl bg-glass border border-border text-primary placeholder:text-secondary text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-secondary hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm mt-2"
              disabled={newPasswordMutation.isPending}
            >
              {newPasswordMutation.isPending
                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                : (t('save_changes') || 'Save Password')}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
