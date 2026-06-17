import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../../../components/GlassUI';
import { ShadcnOTPInput } from '../../../components/OTPInput';
import { useLanguage } from '../../../i18n';
import { Loader2, Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../../../theme';
import { useNavigate } from '@tanstack/react-router';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useResendOtp } from '../hooks/useResendOtp';
import { requestForToken } from '../../../lib/firebase';

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  // Lazy initializers: read sessionStorage ONCE on first mount.
  // Plain `const` would re-read on every render, so after StrictMode's
  // effect-cleanup cycle deletes the keys the component would see undefined.
  const [phone] = useState<string | undefined>(() => sessionStorage.getItem('otp_phone') ?? undefined);
  const [country_id] = useState<number | undefined>(() => {
    const raw = sessionStorage.getItem('otp_country_id');
    return raw ? Number(raw) : undefined;
  });
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [otp, setOtp] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [timer, setTimer] = useState(40);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    const getDeviceId = async () => {
      // Try to get Firebase FCM token first
      const fcmToken = await requestForToken();
      if (fcmToken) {
        setDeviceId(fcmToken);
        localStorage.setItem('device_id', fcmToken);
      } else {
        // Fallback to random ID if FCM fails/denied
        let storedDeviceId = localStorage.getItem('device_id');
        if (!storedDeviceId) {
          storedDeviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
          localStorage.setItem('device_id', storedDeviceId);
        }
        setDeviceId(storedDeviceId);
      }
    };

    getDeviceId();

    // If no phone number is provided, redirect back to login
    if (!phone) {
      navigate({ to: '/login' });
    }
  }, [phone, navigate]);

  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  const handleResendOtp = () => {
    if (phone && country_id != null) {
      resendMutation.mutate({ phone, country_id });
      setTimer(40);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4 && phone) {
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('otp', otp);
      formData.append('device_id', deviceId);
      formData.append('device_type', 'web');
      if (country_id != null) {
        formData.append('country_id', String(country_id));
      }

      verifyMutation.mutate(formData);
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

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-brand-500/20 to-transparent rounded-[100%] blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-glass border border-border rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-brand-500/10">
            <img
              src="https://raiyansoft.com/wp-content/uploads/2026/02/icon-s-d.png"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {t('verify_otp') || 'Verify OTP'}
          </h1>
          <p className="text-sm text-secondary">
            {t('enter_otp_desc') || 'Enter the code sent to your phone'}
            {phone && <span className="block mt-1 font-bold text-brand-500" dir="ltr">{phone}</span>}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">{t('otp_code') || 'OTP Code'}</label>
              <div className="py-4">
                <ShadcnOTPInput
                  value={otp}
                  onChange={setOtp}
                  maxLength={4}
                  disabled={verifyMutation.isPending}
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm mt-2"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (t('verify') || 'Verify')}
            </Button>
            <div className="text-center mt-6 space-y-4">
              {timer > 0 ? (
                <p className="text-sm text-secondary">
                  {t('resend_otp_in') || 'Resend code in'} <span className="font-bold text-primary">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendMutation.isPending}
                  className="text-sm font-bold text-brand-500 hover:underline disabled:opacity-50"
                >
                  {resendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (t('resend_otp') || 'Resend OTP')}
                </button>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/sign-up' })}
                  className="text-xs text-secondary hover:text-primary transition-colors"
                >
                  {t('change_phone') || 'Change phone number'}
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
