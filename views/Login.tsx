import React, { useState } from 'react';
import { GlassCard, Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { ChevronLeft, Phone, Lock } from 'lucide-react';

import { useNavigate } from '@tanstack/react-router';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('+965 1234 5678');
  const [otp, setOtp] = useState('1234');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length > 5) {
      setStep('OTP');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      navigate({ to: '/' });
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
            {step === 'PHONE' ? t('sign_in') || 'Sign In' : t('verify_otp') || 'Verify OTP'}
          </h1>
          <p className="text-sm text-secondary">
            {step === 'PHONE' 
              ? t('enter_phone_desc') || 'Enter your phone number to continue' 
              : t('enter_otp_desc') || 'Enter the code sent to your phone'}
          </p>
        </div>

        <GlassCard className="p-6">
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('phone_number') || 'Phone Number'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +965 1234 5678"
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    dir="ltr"
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full h-12 text-sm mt-2">
                {t('sign_in') || 'Sign In'}
              </Button>
            </form>
          ) : (
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
                    placeholder="1234"
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-center tracking-[0.5em] text-lg font-bold text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    dir="ltr"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full h-12 text-sm mt-2">
                {t('verify') || 'Verify'}
              </Button>
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setStep('PHONE')}
                  className="text-xs text-secondary hover:text-primary transition-colors"
                >
                  {t('change_phone') || 'Change phone number'}
                </button>
              </div>
            </form>
          )}
        </GlassCard>

        <div className="text-center mt-6">
          <p className="text-sm text-secondary">
            {t('dont_have_account') || "Don't have an account?"}{' '}
            <button 
              onClick={() => navigate({ to: '/sign-up' })}
              className="text-brand-500 font-bold hover:underline"
            >
              {t('sign_up') || 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
