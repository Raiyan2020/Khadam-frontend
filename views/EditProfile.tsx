import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Camera, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n';
import { UserRole } from '../types';
import { GlassCard, Button, Avatar } from '../components/GlassUI';

import { useNavigate } from '@tanstack/react-router';
import { PhoneInput } from '../components/PhoneInput';
import { useUserRole } from '../UserRoleContext';
import { useProfile } from '../features/auth/hooks/useProfile';
import { useUpdateProfile } from '../features/auth/hooks/useUpdateProfile';

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useUserRole();
  const { t, dir } = useLanguage();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState<any>({
    name: '',
    phone: '',
    email: '',
    state_name: '',
    website: '',
    description: '',
    whatsapp: '',
    map_desc: '',
  });

  const [images, setImages] = useState<{ image: File | null; cover_image: File | null }>({
    image: null,
    cover_image: null,
  });

  const [previews, setPreviews] = useState<{ image: string | null; cover_image: string | null }>({
    image: null,
    cover_image: null,
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      let pPhone = profile.phone || '';
      if (pPhone && !pPhone.startsWith('+')) pPhone = '+' + pPhone;
      
      let pWhatsapp = profile.whatsapp || '';
      if (pWhatsapp && !pWhatsapp.startsWith('+')) pWhatsapp = '+' + pWhatsapp;

      setFormData({
        name: profile.name || '',
        phone: pPhone,
        email: profile.email || '',
        state_name: profile.state_name || '',
        website: profile.website || '',
        description: profile.description || '',
        whatsapp: pWhatsapp,
        map_desc: profile.map_desc || '',
      });
      setPreviews({
        image: profile.image,
        cover_image: profile.cover_image,
      });
    }
  }, [profile]);

  const isCompany = profile?.type === '2';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'cover_image') => {
    const file = e.target.files?.[0];
    if (file) {
      setImages(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });
    
    if (images.image) {
      data.append('image', images.image);
    }
    if (images.cover_image) {
      data.append('cover_image', images.cover_image);
    }

    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        navigate({ to: '/profile' });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

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
        {isCompany && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 border border-border bg-glass">
            {previews.cover_image ? (
              <img
                src={previews.cover_image}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary opacity-50">
                <Camera size={40} />
              </div>
            )}
            <input
              type="file"
              ref={coverInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'cover_image')}
            />
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-2 end-2 bg-background/80 backdrop-blur-sm text-primary rounded-full p-2 border border-border hover:scale-105 transition-transform shadow-lg flex items-center gap-2 px-3"
            >
              <Camera size={16} />
              <span className="text-xs font-medium">{t('change_banner') || 'Change Banner'}</span>
            </button>
          </div>
        )}

        {/* Profile Image Section */}
        <div className={`flex flex-col items-center ${isCompany ? '-mt-16 relative z-10' : ''}`}>
          <div className="relative">
            <Avatar
              src={previews.image || (userRole === UserRole.SEEKER ? "https://picsum.photos/seed/user/200/200" : "https://picsum.photos/seed/office1/200/200")}
              alt="Profile"
              size="xl"
              className="border-4 border-background"
            />
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'image')}
            />
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="absolute bottom-0 end-0 bg-accent text-accent-fg rounded-full p-2 border-4 border-background hover:scale-105 transition-transform shadow-lg"
            >
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
            <PhoneInput
              value={formData.phone}
              onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
              placeholder="XXXX XXXX"
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
          {isCompany && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary px-1">{t('location') || 'Location'}</label>
                <input
                  type="text"
                  name="state_name"
                  value={formData.state_name}
                  onChange={handleChange}
                  className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary px-1">{t('whatsapp') || 'WhatsApp'}</label>
                <PhoneInput
                  value={formData.whatsapp}
                  onChange={(val) => setFormData(prev => ({ ...prev, whatsapp: val }))}
                  placeholder="XXXX XXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary px-1">{t('website') || 'Website'}</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-glass border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary px-1">{t('description') || 'Bio / Description'}</label>
                <textarea
                  name="description"
                  value={formData.description}
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
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {t('save_changes') || 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

