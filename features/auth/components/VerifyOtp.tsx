import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../../../components/GlassUI';
import { useLanguage } from '../../../i18n';
import { Lock, Loader2 } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useResendOtp } from '../hooks/useResendOtp';

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/verify-otp' }) as { phone?: string };
  const { t } = useLanguage();
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
    // Generate or retrieve a device_id
    let storedDeviceId = localStorage.getItem('device_id');
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // If no phone number is provided, redirect back to login
    if (!search.phone) {
      navigate({ to: '/login' });
    }
  }, [search.phone, navigate]);

  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  const handleResendOtp = () => {
    if (search.phone) {
      resendMutation.mutate(search.phone);
      setTimer(40);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4 && search.phone) {
      const formData = new FormData();
      formData.append('phone', search.phone);
      formData.append('otp', otp);
      formData.append('device_id', deviceId);
      formData.append('device_type', 'web');

      verifyMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
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
            {search.phone && <span className="block mt-1 font-bold text-brand-500" dir="ltr">{search.phone}</span>}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">{t('otp_code') || 'OTP Code'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                  <Lock size={18} />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="XXXX"
                  className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-center tracking-[0.5em] text-lg font-bold text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  dir="ltr"
                  maxLength={6}
                  required
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
                  onClick={() => navigate({ to: '/login' })}
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
