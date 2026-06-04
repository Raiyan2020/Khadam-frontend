import React, { useState } from 'react';
import { GlassCard, Button } from '../../../components/GlassUI';
import { useLanguage } from '../../../i18n';
import { Loader2, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { PhoneInput, splitPhone } from '../../../components/PhoneInput';
import { ApiCountry } from '../../../lib/useCountryCodes';
import { useLogin, LoginPayload } from '../hooks/useLogin';
import { z } from 'zod';
import { toast } from 'sonner';

type LoginTab = 'phone' | 'email';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Tab state
  const [activeTab, setActiveTab] = useState<LoginTab>('phone');

  // Phone-tab state
  const [phoneNumber, setPhoneNumber] = useState('+965');
  const [selectedCountry, setSelectedCountry] = useState<ApiCountry | null>(null);

  // Email-tab state
  const [email, setEmail] = useState('');

  // Shared
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();

  // ─── Validation schemas ──────────────────────────────────────────────────
  const phoneSchema = z.object({
    phoneNumber: z.string().min(8, t('phone_min_length') || 'Phone number must be at least 8 digits'),
    password: z.string().min(1, t('password_required') || 'Password is required'),
  });

  const emailSchema = z.object({
    email: z.string().email(t('invalid_email') || 'Please enter a valid email address'),
    password: z.string().min(1, t('password_required') || 'Password is required'),
  });

  // ─── Submit handler ──────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payload: LoginPayload;
      if (activeTab === 'phone') {
        phoneSchema.parse({ phoneNumber, password });
        const { phone } = splitPhone(phoneNumber);
        payload = {
          login_type: 'phone',
          country_id: selectedCountry?.id ?? 1,
          phone,
          password,
        };
      } else {
        emailSchema.parse({ email, password });
        payload = {
          login_type: 'email',
          email,
          password,
        };
      }
      loginMutation.mutate(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
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
            {activeTab === 'phone'
              ? (t('enter_phone_desc') || 'Enter your phone number to continue')
              : (t('enter_email_desc') || 'Enter your email address to continue')}
          </p>
        </div>

        <GlassCard className="p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-glass border border-border p-1 mb-5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('phone')}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'phone'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'text-secondary hover:text-primary'
                }`}
            >
              <Phone size={13} />
              {t('phone') || 'Phone'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'email'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'text-secondary hover:text-primary'
                }`}
            >
              <Mail size={13} />
              {t('email') || 'Email'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {activeTab === 'phone' ? (
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
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">
                  {t('email') || 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder') || 'example@email.com'}
                  className="w-full h-12 px-4 rounded-xl bg-glass border border-border text-primary placeholder:text-secondary text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  autoComplete="email"
                />
              </div>
            )}

            {/* Password field */}
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
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-secondary hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm mt-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                : (t('sign_in') || 'Sign In')}
            </Button>
          </form>
        </GlassCard>

        {/* Forgot password */}
        <div className="text-center -mt-4">
          <button
            type="button"
            onClick={() => navigate({ to: '/forgot-password' })}
            className="text-sm text-brand-500 hover:underline font-medium"
          >
            {t('forgot_password') || 'Forgot password?'}
          </button>
        </div>

        {/* Sign up link */}
        <div className="text-center mt-2">
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
