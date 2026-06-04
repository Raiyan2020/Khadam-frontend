import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../../../components/GlassUI';
import { ShadcnOTPInput } from '../../../components/OTPInput';
import { useLanguage } from '../../../i18n';
import { Loader2 } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCheckResetCode } from '../hooks/useCheckResetCode';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { splitPhone } from '../../../components/PhoneInput';

export const ResetOtp: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const search = useSearch({ from: '/reset-otp' }) as { phone?: string; country_id?: number };

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(40);

  useEffect(() => {
    if (!search.phone) {
      navigate({ to: '/forgot-password' });
    }
  }, [search.phone, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const checkCodeMutation = useCheckResetCode();
  const resendMutation = useForgotPassword();

  const handleResend = () => {
    if (search.phone && search.country_id != null) {
      resendMutation.mutate({ phone: search.phone, country_id: search.country_id });
      setTimer(40);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4 && search.phone && search.country_id != null) {
      checkCodeMutation.mutate({
        phone: search.phone,
        country_id: search.country_id,
        code: otp,
      });
    }
  };

  // Display full phone (add + prefix if missing)
  const displayPhone = search.phone
    ? search.phone.startsWith('+') ? search.phone : `+${search.phone}`
    : '';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
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
            {t('verify_otp') || 'Verify Code'}
          </h1>
          <p className="text-sm text-secondary">
            {t('enter_otp_desc') || 'Enter the code sent to your phone'}
            {displayPhone && (
              <span className="block mt-1 font-bold text-brand-500" dir="ltr">
                {displayPhone}
              </span>
            )}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {t('otp_code') || 'OTP Code'}
              </label>
              <div className="py-4">
                <ShadcnOTPInput
                  value={otp}
                  onChange={setOtp}
                  maxLength={4}
                  disabled={checkCodeMutation.isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm mt-2"
              disabled={checkCodeMutation.isPending || otp.length < 4}
            >
              {checkCodeMutation.isPending
                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                : (t('verify') || 'Verify')}
            </Button>

            <div className="text-center mt-4 space-y-3">
              {timer > 0 ? (
                <p className="text-sm text-secondary">
                  {t('resend_otp_in') || 'Resend code in'}{' '}
                  <span className="font-bold text-primary">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-sm font-bold text-brand-500 hover:underline disabled:opacity-50"
                >
                  {resendMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    : (t('resend_otp') || 'Resend Code')}
                </button>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/forgot-password' })}
                  className="text-xs text-secondary hover:text-primary transition-colors"
                >
                  ← {t('change_phone') || 'Change phone number'}
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
