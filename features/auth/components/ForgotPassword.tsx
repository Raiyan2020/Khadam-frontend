import React, { useState } from 'react';
import { GlassCard, Button } from '../../../components/GlassUI';
import { useLanguage } from '../../../i18n';
import { Loader2, Phone, Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../../../theme';
import { useNavigate } from '@tanstack/react-router';
import { PhoneInput, splitPhone } from '../../../components/PhoneInput';
import { ApiCountry } from '../../../lib/useCountryCodes';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { z } from 'zod';
import { toast } from 'sonner';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [phoneNumber, setPhoneNumber] = useState('+965');
  const [selectedCountry, setSelectedCountry] = useState<ApiCountry | null>(null);

  const forgotMutation = useForgotPassword();

  const schema = z.object({
    phoneNumber: z.string().min(8, t('phone_min_length') || 'Phone number must be at least 8 digits'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      schema.parse({ phoneNumber });
      const { phone } = splitPhone(phoneNumber);
      forgotMutation.mutate({
        phone,
        country_id: selectedCountry?.id ?? 1,
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
            {t('forgot_password') || 'Forgot Password'}
          </h1>
          <p className="text-sm text-secondary">
            {t('forgot_password_desc') || 'Enter your phone number to receive a reset code'}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {t('phone_number') || 'Phone Number'}
              </label>
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                onCountryChange={setSelectedCountry}
                placeholder="XXXX XXXX"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm mt-2"
              disabled={forgotMutation.isPending}
            >
              {forgotMutation.isPending
                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                : (t('send_reset_code') || 'Send Reset Code')}
            </Button>
          </form>
        </GlassCard>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate({ to: '/login' })}
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            ← {t('back_to_login') || 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
