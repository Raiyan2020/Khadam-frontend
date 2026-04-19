import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Save, CheckCircle } from 'lucide-react';
import { useLanguage } from '../i18n';
import { UserRole } from '../types';
import { GlassCard, Button, Avatar } from '../components/GlassUI';

import { useNavigate } from '@tanstack/react-router';
import { useUserRole } from '../UserRoleContext';

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useUserRole();
  const { t, dir } = useLanguage();
  const isSeeker = userRole === UserRole.SEEKER;

  // Mock initial data based on role
  const initialData = isSeeker ? {
    name: 'Guest User',
    phone: '+965 1234 5678',
    email: 'guest@example.com',
  } : {
    name: 'Al-Nour Recruitment',
    phone: '+965 9876 5432',
    email: 'contact@alnour.com',
    location: 'Kuwait City, Sharq',
    website: 'www.alnour.com',
    bio: 'Leading recruitment agency in Kuwait with over 10 years of experience.',
    isVerified: true,
  };

  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Implement save logic here
    console.log('Saving profile data:', formData);
    navigate({ to: '/profile' });
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 flex items-center gap-4">
        <button 
          onClick={() => navigate({ to: '/profile' })}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <h1 className="text-xl font-bold text-primary">{t('edit_profile') || 'Edit Profile'}</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Banner Section (Business Only) */}
        {!isSeeker && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 border border-border">
            <img 
              src="https://picsum.photos/seed/banner/800/300" 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
            <button className="absolute bottom-2 end-2 bg-background/80 backdrop-blur-sm text-primary rounded-full p-2 border border-border hover:scale-105 transition-transform shadow-lg flex items-center gap-2 px-3">
              <Camera size={16} />
              <span className="text-xs font-medium">{t('change_banner') || 'Change Banner'}</span>
            </button>
          </div>
        )}

        {/* Profile Image Section */}
        <div className={`flex flex-col items-center ${!isSeeker ? '-mt-16 relative z-10' : ''}`}>
          <div className="relative">
            <Avatar 
              src={isSeeker ? "https://picsum.photos/seed/user/200/200" : "https://picsum.photos/seed/office1/200/200"} 
              alt="Profile" 
              size="xl" 
              className="border-4 border-background" 
            />
            {(!isSeeker && (formData as any).isVerified) && (
              <div className="absolute top-1 end-1 bg-[#1877F2] text-white rounded-full p-0.5 border-2 border-background shadow-lg animate-in zoom-in duration-500 flex items-center justify-center">
                <CheckCircle size={12} fill="currentColor" stroke="none" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[6px] h-[3px] border-b-2 border-s-2 border-white rotate-[-45deg] -mt-[1px]"></div>
                </div>
              </div>
            )}
            <button className="absolute bottom-0 end-0 bg-accent text-accent-fg rounded-full p-2 border-4 border-background hover:scale-105 transition-transform shadow-lg">
              <Camera size={18} />
            </button>
          </div>
          <p className="text-sm text-secondary mt-3">{t('change_photo') || 'Change Photo'}</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary px-1">{t('full_name') || 'Full Name'}</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary px-1">{t('phone_number') || 'Phone Number'}</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary px-1">{t('email') || 'Email'}</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              dir="ltr"
            />
          </div>

          {/* Business Specific Fields */}
          {!isSeeker && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary px-1">{t('location') || 'Location'}</label>
                <input 
                  type="text" 
                  name="location"
                  value={(formData as any).location || ''}
                  onChange={handleChange}
                  className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary px-1">{t('website') || 'Website'}</label>
                <input 
                  type="url" 
                  name="website"
                  value={(formData as any).website || ''}
                  onChange={handleChange}
                  className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary px-1">{t('bio') || 'Bio / Description'}</label>
                <textarea 
                  name="bio"
                  value={(formData as any).bio || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <Button 
            variant="primary" 
            fullWidth 
            className="py-4 text-lg font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
            onClick={handleSave}
          >
            <Save size={20} />
            {t('save_changes') || 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
