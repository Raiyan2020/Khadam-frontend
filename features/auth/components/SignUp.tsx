import React, { useState } from 'react';
import { normalizeArabicNumbers } from '../../../lib/numbers';
import { GlassCard, Button } from '../../../components/GlassUI';
import { useLanguage } from '../../../i18n';
import { ChevronLeft, Phone, User, Building, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { PhoneInput, splitPhone } from '../../../components/PhoneInput';
import { ApiCountry } from '../../../lib/useCountryCodes';
import { useRegister } from '../hooks/useRegister';
import { z } from 'zod';
import { toast } from 'sonner';

type SignUpStep = 'ACCOUNT_TYPE' | 'PHONE';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const [step, setStep] = useState<SignUpStep>('ACCOUNT_TYPE');
  const [accountType, setAccountType] = useState<'1' | '2' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('+965');
  const [selectedCountry, setSelectedCountry] = useState<ApiCountry | null>(null);

  const registerMutation = useRegister();

  const signUpSchema = z.object({
    phoneNumber: z.string().min(8, t('phone_min_length') || 'Phone number must be at least 8 digits'),
    accountType: z.enum(['1', '2'], { message: t('account_type_required') || 'Account type is required' }),
  });

  const handleSelectAccountType = (type: '1' | '2') => {
    setAccountType(type);
    setStep('PHONE');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      signUpSchema.parse({ phoneNumber, accountType });
      const { phone } = splitPhone(phoneNumber);
      registerMutation.mutate({ type: accountType!, country_id: selectedCountry?.id ?? 1, phone });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    }
  };

  const renderAccountType = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl font-bold text-primary">{t('choose_account_type') || 'Choose Account Type'}</h1>
        <p className="text-sm text-secondary">{t('account_type_desc') || 'Select how you want to use the app'}</p>
      </div>

      <GlassCard
        className="p-6 cursor-pointer hover:border-brand-400 transition-all flex items-center gap-4 group"
        onClick={() => handleSelectAccountType('1')}
      >
        <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
          <User size={24} />
        </div>
        <div>
          <h3 className="font-bold text-primary text-lg">{t('personal_account') || 'Personal Account'}</h3>
          <p className="text-xs text-secondary">{t('personal_account_desc') || 'See ads and hire workers'}</p>
        </div>
      </GlassCard>

      <GlassCard
        className="p-6 cursor-pointer hover:border-accent transition-all flex items-center gap-4 group"
        onClick={() => handleSelectAccountType('2')}
      >
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
          <Building size={24} />
        </div>
        <div>
          <h3 className="font-bold text-primary text-lg">{t('business_account') || 'Business Account'}</h3>
          <p className="text-xs text-secondary">{t('business_account_desc') || 'Publish ads and manage workers'}</p>
        </div>
      </GlassCard>
    </div>
  );

  const renderPhone = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-primary">{t('enter_phone') || 'Enter Phone'}</h1>
        <p className="text-sm text-secondary">{t('enter_phone_desc') || 'Enter your phone number to continue'}</p>
      </div>
      <GlassCard className="p-6">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary px-1">{t('phone_number') || 'Phone Number'}</label>
            <div className="relative">
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                onCountryChange={setSelectedCountry}
                placeholder="XXXX XXXX"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full h-12 text-sm mt-2"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (t('sign_up') || 'Sign Up')}
          </Button>
        </form>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-brand-500/20 to-transparent rounded-[100%] blur-3xl pointer-events-none" />

      <div className="absolute top-8 start-8 z-20">
        <button
          onClick={() => {
            if (step === 'ACCOUNT_TYPE') navigate({ to: '/login' });
            else if (step === 'PHONE') setStep('ACCOUNT_TYPE');
          }}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="w-full max-w-md z-10">
        {step === 'ACCOUNT_TYPE' && renderAccountType()}
        {step === 'PHONE' && renderPhone()}

        <div className="text-center mt-6">
          <p className="text-sm text-secondary">
            {t('already_have_account') || "Already have an account?"}{' '}
            <button
              onClick={() => navigate({ to: '/login' })}
              className="text-brand-500 font-bold hover:underline"
            >
              {t('sign_in') || 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
