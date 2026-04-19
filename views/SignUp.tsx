import React, { useState, useRef } from 'react';
import { GlassCard, Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { ChevronLeft, Phone, Lock, User, Building, MapPin, Globe, FileText, Camera, Image as ImageIcon, CreditCard, Mail, X } from 'lucide-react';

import { useNavigate } from '@tanstack/react-router';
import { LocationPicker, KUWAIT_CITIES } from '../components/LocationPicker';
import type { LatLng } from '../components/LocationPicker';

type SignUpStep = 'ACCOUNT_TYPE' | 'PHONE' | 'OTP' | 'PROFILE_SETUP';
type AccountType = 'PERSONAL' | 'BUSINESS' | null;

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [step, setStep] = useState<SignUpStep>('ACCOUNT_TYPE');
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [phoneNumber, setPhoneNumber] = useState('+965 1234 5678');
  const [otp, setOtp] = useState('1234');

  // Profile Setup State
  const [name, setName] = useState('John Doe');
  const [businessName, setBusinessName] = useState('Al-Aman Recruitment');
  const [locationData, setLocationData] = useState<{ cityEn: string; position: LatLng | null }>({
    cityEn: KUWAIT_CITIES[0].nameEn,
    position: null,
  });
  const [website, setWebsite] = useState('https://alaman.com');
  const [contactNumber, setContactNumber] = useState('+965 9876 5432');
  const [description, setDescription] = useState('We provide the best domestic workers in Kuwait.');
  const [email, setEmail] = useState('');

  // New Business Registration States
  const [responsibleId, setResponsibleId] = useState('');
  const [responsibleNumber, setResponsibleNumber] = useState('');

  // File Upload States
  const [taxFiles, setTaxFiles] = useState<File[]>([]);
  const [taxPreviews, setTaxPreviews] = useState<{ name: string; url: string | null }[]>([]);
  const [responsibleIdFile, setResponsibleIdFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [responsibleIdPreview, setResponsibleIdPreview] = useState<string | null>(null);

  // Input Refs
  const taxInputRef = useRef<HTMLInputElement>(null);
  const responsibleIdRef = useRef<HTMLInputElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);

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

  const handleTaxFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'image/png' || 
      file.type === 'image/jpeg'
    );

    if (validFiles.length > 0) {
      setTaxFiles(prev => [...prev, ...validFiles]);
      
      const newPreviews = validFiles.map(file => ({
        name: file.name,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      
      setTaxPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeTaxFile = (index: number) => {
    setTaxFiles(prev => prev.filter((_, i) => i !== index));
    setTaxPreviews(prev => {
      const removed = prev[index];
      if (removed.url) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      setStep('PROFILE_SETUP');
    }
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the profile data
    navigate({ to: '/' });
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
            <div
              onClick={() => profileImageRef.current?.click()}
              className="w-24 h-24 rounded-full bg-glass border-2 border-dashed border-border flex items-center justify-center text-secondary relative overflow-hidden group cursor-pointer hover:border-brand-400 transition-colors"
            >
              <input
                type="file"
                ref={profileImageRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setProfileImagePreview(URL.createObjectURL(file));
                }}
                accept="image/*"
              />
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="group-hover:text-brand-400 transition-colors" />
              )}
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
                <div
                  onClick={() => bannerImageRef.current?.click()}
                  className="w-full h-32 rounded-xl bg-glass border-2 border-dashed border-border flex flex-col items-center justify-center text-secondary cursor-pointer hover:border-brand-400 transition-colors relative overflow-hidden group"
                >
                  <input
                    type="file"
                    ref={bannerImageRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setBannerImagePreview(URL.createObjectURL(file));
                    }}
                    accept="image/*"
                  />
                  {bannerImagePreview ? (
                    <img src={bannerImagePreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={24} className="mb-2 group-hover:text-brand-400 transition-colors" />
                      <span className="text-xs">{t('upload_banner') || 'Upload Banner'}</span>
                    </>
                  )}
                  {bannerImagePreview && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">{t('change') || 'Change'}</span>
                    </div>
                  )}
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
              <LocationPicker
                value={locationData}
                onChange={setLocationData}
              />

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

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('email')} ({t('optional')})</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Commercial License File Upload */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-primary px-1">{t('company_tax_id') || 'Commercial License File'}</label>
                
                {/* Upload Area */}
                <div
                  onClick={() => taxInputRef.current?.click()}
                  className="w-full h-32 rounded-xl bg-glass border-2 border-dashed border-border flex flex-col items-center justify-center text-secondary group cursor-pointer hover:border-brand-400 transition-colors"
                >
                  <input
                    type="file"
                    ref={taxInputRef}
                    className="hidden"
                    onChange={handleTaxFilesChange}
                    accept="image/png, image/jpeg, application/pdf"
                    multiple
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                      <ImageIcon size={20} />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-primary">{t('upload_files') || 'Upload Files'}</span>
                      <p className="text-[10px] text-secondary mt-0.5">{t('upload_hint') || 'Supports JPG, PNG, PDF'}</p>
                    </div>
                  </div>
                </div>

                {/* File List / Previews */}
                {taxPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {taxPreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-glass">
                        {preview.url ? (
                          <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                            <FileText size={24} className="text-secondary" />
                            <span className="text-[8px] text-secondary text-center line-clamp-2 px-1">{preview.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTaxFile(index);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Responsible Personnel Information */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-primary px-1">{t('responsible_id') || 'Responsible ID'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <CreditCard size={18} />
                  </div>
                  <input
                    type="text"
                    value={responsibleId}
                    onChange={(e) => setResponsibleId(e.target.value)}
                    placeholder={t('responsible_id_placeholder') || 'Enter ID details'}
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('responsible_number') || 'Responsible Phone Number'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={responsibleNumber}
                    onChange={(e) => setResponsibleNumber(e.target.value)}
                    placeholder="+965 XXXX XXXX"
                    className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary px-1">{t('responsible_id_file') || 'Responsible ID File'}</label>
                <div
                  onClick={() => responsibleIdRef.current?.click()}
                  className="w-full h-32 rounded-xl bg-glass border-2 border-dashed border-border flex items-center justify-center text-secondary group cursor-pointer hover:border-brand-400 transition-colors px-4"
                >
                  <input
                    type="file"
                    ref={responsibleIdRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setResponsibleIdFile(file);
                      if (file && file.type.startsWith('image/')) {
                        setResponsibleIdPreview(URL.createObjectURL(file));
                      } else {
                        setResponsibleIdPreview(null);
                      }
                    }}
                    accept="image/*,.pdf"
                  />
                  {responsibleIdPreview ? (
                    <img src={responsibleIdPreview} alt="Responsible ID" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={18} className={`me-2 transition-colors ${responsibleIdFile ? 'text-brand-400' : 'group-hover:text-brand-400'}`} />
                      <span className="text-xs font-medium truncate">
                        {responsibleIdFile ? responsibleIdFile.name : (t('upload_responsible_id') || 'Upload ID Picture')}
                      </span>
                    </>
                  )}
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
            if (step === 'ACCOUNT_TYPE') navigate({ to: '/login' });
            else if (step === 'PHONE') setStep('ACCOUNT_TYPE');
            else if (step === 'OTP') setStep('PHONE');
            else if (step === 'PROFILE_SETUP') setStep('OTP');
          }}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
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
