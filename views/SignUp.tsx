'use client';

import React, { useState } from 'react';
import { GlassCard, Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { ChevronLeft, Phone, Lock, User, Building, MapPin, Globe, FileText, Camera, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SignUpStep = 'ACCOUNT_TYPE' | 'PHONE' | 'OTP' | 'PROFILE_SETUP';
type AccountType = 'PERSONAL' | 'BUSINESS' | null;

export const SignUp: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<SignUpStep>('ACCOUNT_TYPE');
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [phoneNumber, setPhoneNumber] = useState('+965 1234 5678');
  const [otp, setOtp] = useState('1234');
  
  // Profile Setup State
  const [name, setName] = useState('John Doe');
  const [businessName, setBusinessName] = useState('Al-Aman Recruitment');
  const [location, setLocation] = useState('Kuwait City');
  const [website, setWebsite] = useState('https://alaman.com');
  const [contactNumber, setContactNumber] = useState('+965 9876 5432');
  const [description, setDescription] = useState('We provide the best domestic workers in Kuwait.');

  const handleSelectAccountType = (type: AccountType) => {
    setAccountType(type);
    setStep('PHONE');
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length > 5) {
      setStep('OTP');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      setStep('PROFILE_SETUP');
    }
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace('/');
  };

  const renderAccountType = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl font-bold text-primary">{t('choose_account_type') || 'Choose Account Type'}</h1>
        <p className="text-sm text-secondary">{t('account_type_desc') || 'Select how you want to use the app'}</p>
      </div>
      
      <GlassCard 
        className="p-6 cursor-pointer hover:border-brand-400 transition-all flex items-center gap-4 group"
        onClick={() => handleSelectAccountType('PERSONAL')}
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
        onClick={() => handleSelectAccountType('BUSINESS')}
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
            {t('send_otp') || 'Send OTP'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );

  const renderOtp = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-primary">{t('verify_otp') || 'Verify OTP'}</h1>
        <p className="text-sm text-secondary">{t('enter_otp_desc') || 'Enter the code sent to your phone'}</p>
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
        </form>
      </GlassCard>
    </div>
  );

  const renderProfileSetup = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-primary">{t('setup_profile') || 'Setup Profile'}</h1>
        <p className="text-sm text-secondary">{t('setup_profile_desc') || 'Complete your profile details'}</p>
      </div>
      <GlassCard className="p-6">
        <form onSubmit={handleCompleteProfile} className="space-y-4">
          
          {/* Profile Image (Both) */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-24 h-24 rounded-full bg-glass border-2 border-dashed border-border flex items-center justify-center text-secondary relative overflow-hidden group cursor-pointer hover:border-brand-400 transition-colors">
              <Camera size={24} className="group-hover:text-brand-400 transition-colors" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">{t('upload') || 'Upload'}</span>
              </div>
            </div>
            <span className="text-xs text-secondary">{t('profile_image') || 'Profile Image'}</span>
          </div>

          {accountType === 'BUSINESS' && (
            <>
              {/* Banner Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('banner_image') || 'Banner Image'}</label>
                <div className="w-full h-32 rounded-xl bg-glass border-2 border-dashed border-border flex flex-col items-center justify-center text-secondary cursor-pointer hover:border-brand-400 transition-colors">
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-xs">{t('upload_banner') || 'Upload Banner'}</span>
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('business_name') || 'Business Name'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <Building size={18} />
                  </div>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={t('business_name_placeholder') || 'Enter business name'}
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('location') || 'Location'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t('location_placeholder') || 'e.g. Kuwait City'}
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('website') || 'Website (Optional)'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <Globe size={18} />
                  </div>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('contact_number') || 'Business Contact Number'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+965 1234 5678"
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('description') || 'Description'}</label>
                <div className="relative">
                  <div className="absolute top-3 start-3 pointer-events-none text-secondary">
                    <FileText size={18} />
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('description_placeholder') || 'Tell us about your business...'}
                    className="w-full min-h-[100px] bg-background border border-border rounded-xl ps-10 pe-4 py-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all resize-y"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {accountType === 'PERSONAL' && (
            <>
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('full_name') || 'Full Name'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('name_placeholder') || 'Enter your full name'}
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <Button type="submit" variant="primary" className="w-full h-12 text-sm mt-6">
            {t('complete_signup') || 'Complete Sign Up'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden pb-20">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-brand-500/20 to-transparent rounded-[100%] blur-3xl pointer-events-none" />
      
      <div className="absolute top-5 start-5 z-20">
        <button 
          onClick={() => {
            if (step === 'ACCOUNT_TYPE') router.push('/login');
            else if (step === 'PHONE') setStep('ACCOUNT_TYPE');
            else if (step === 'OTP') setStep('PHONE');
            else if (step === 'PROFILE_SETUP') setStep('OTP');
          }}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
        >
          {dir === 'rtl' ? <ChevronRightIcon size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="w-full max-w-md z-10">
        {step === 'ACCOUNT_TYPE' && renderAccountType()}
        {step === 'PHONE' && renderPhone()}
        {step === 'OTP' && renderOtp()}
        {step === 'PROFILE_SETUP' && renderProfileSetup()}

        <div className="text-center mt-6">
          <p className="text-sm text-secondary">
            {t('already_have_account') || "Already have an account?"}{' '}
            <button 
              onClick={() => router.push('/login')}
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

const ChevronRightIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
