import React, { useState, useRef, useEffect } from 'react';
import { normalizeArabicNumbers } from '../../../lib/numbers';
import { GlassCard, Button } from '../../../components/GlassUI';
import { Camera, Image as ImageIcon, User, Building, Phone, Globe, FileText, CreditCard, Mail, X, MapPin, Loader2 } from 'lucide-react';
import { PhoneInput, splitPhone } from '../../../components/PhoneInput';
import { ApiCountry } from '../../../lib/useCountryCodes';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LocationPicker, LatLng } from '../../../components/LocationPicker';
import { useCompleteProfile } from '../hooks/useCompleteProfile';
import { useStates, StateOption } from '../hooks/useStates';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n';
import imageCompression from 'browser-image-compression';
import { z } from 'zod';


export const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const search = useSearch({ from: '/complete-profile' }) as { phone?: string; country_id?: string };

  const [userType, setUserType] = useState<'1' | '2' | null>(null);

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    if (!type) {
      navigate({ to: '/login' });
    } else {
      setUserType(type as '1' | '2');
    }
  }, [navigate]);

  const { data: statesResponse } = useStates(userType === '2');
  const states: StateOption[] = statesResponse?.data || [];

  // Common Fields
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const [name, setName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);

  // Company Specific Fields
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  const [stateId, setStateId] = useState('');
  const [locationData, setLocationData] = useState<{ position: LatLng | null }>({
    position: null,
  });
  const [mapDesc, setMapDesc] = useState('');
  const [website, setWebsite] = useState('');
  const [whatsapp, setWhatsapp] = useState('+965');
  const [email, setEmail] = useState('');

  const [commercialLicenseFile, setCommercialLicenseFile] = useState<File | null>(null);
  const [commercialLicensePreview, setCommercialLicensePreview] = useState<string | null>(null);
  const commercialLicenseRef = useRef<HTMLInputElement>(null);

  const [nationalNumberManager, setNationalNumberManager] = useState('');
  const [phoneManager, setPhoneManager] = useState('+965');
  const [phoneCountryId, setPhoneCountryId] = useState<number>(1);
  const [phoneManagerCountryId, setPhoneManagerCountryId] = useState<number>(1);

  const [managerIdImageFile, setManagerIdImageFile] = useState<File | null>(null);
  const [managerIdImagePreview, setManagerIdImagePreview] = useState<string | null>(null);
  const managerIdImageRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');

  // Pre-fill phone from previous OTP step
  const [phone, setPhone] = useState(() => {
    const p = search.phone || '';
    return p.startsWith('+') ? p : p ? '+' + p : '+965';
  });

  const completeProfileMutation = useCompleteProfile();
  const [isCompressing, setIsCompressing] = useState(false);

  // Seeker Schema (User Type 1)
  const seekerSchema = z.object({
    name: z.string().min(3, t('name_required')),
    profileImage: z.any().refine((file) => file !== null, t('profile_image_required')),
  });

  // Company Schema (User Type 2)
  const companySchema = z.object({
    name: z.string().min(3, t('name_required')),
    profileImage: z.any().refine((file) => file !== null, t('profile_image_required')),
    coverImage: z.any().refine((file) => file !== null, t('cover_image_required')),
    stateId: z.string().min(1, t('state_required')),
    location: z.any().refine((loc) => loc?.position !== null, t('location_required')),
    mapDesc: z.string().min(1, t('address_required')),
    website: z.string().url(t('invalid_url')).optional().or(z.literal('')),
    whatsapp: z.string().min(1, t('whatsapp_required') || 'WhatsApp is required'),
    email: z.string().email(t('invalid_email')).optional().or(z.literal('')),
    commercialLicense: z.any().refine((file) => file !== null, t('commercial_license_required')),
    nationalNumberManager: z.string().min(1, t('manager_id_required')),
    phoneManager: z.string().min(1, t('manager_phone_required')),
    managerIdImage: z.any().refine((file) => file !== null, t('manager_id_image_required')),
    description: z.string().min(1, t('description_required')),
  });

  const compressFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return file;
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Image compression error:', error);
      return file;
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for validation
    const dataToValidate = {
      name,
      profileImage: profileImageFile,
      ...(userType === '2' && {
        coverImage: coverImageFile,
        stateId,
        location: locationData,
        mapDesc,
        website,
        whatsapp,
        email,
        commercialLicense: commercialLicenseFile,
        nationalNumberManager,
        phoneManager,
        managerIdImage: managerIdImageFile,
        description,
      }),
    };

    // Perform validation according to user type
    try {
      if (userType === '2') {
        companySchema.parse(dataToValidate);
      } else {
        seekerSchema.parse(dataToValidate);
      }
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);

        const firstErrorField = error.issues[0]?.path[0] as string;
        if (firstErrorField) {
          setTimeout(() => {
            const element = document.getElementById(`field-${firstErrorField}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus({ preventScroll: true });
            }
          }, 50);
        }
        return;
      }
    }

    setIsCompressing(true);
    const formData = new FormData();
    formData.append('name', name);
    const { phone: phoneLocal } = splitPhone(phone);
    if (phone) {
      formData.append('country_id', String(phoneCountryId));
      formData.append('phone', phoneLocal);
    }
    // is_completed_profile: 1 for seeker, 0 for company (company fills extra details separately)
    formData.append('is_completed_profile', userType === '1' ? '1' : '0');

    try {
      const compressedProfileImage = await compressFile(profileImageFile!);
      formData.append('image', compressedProfileImage);

      if (userType === '2') {
        const [compressedCover, compressedLicense, compressedManagerId] = await Promise.all([
          compressFile(coverImageFile!),
          compressFile(commercialLicenseFile!),
          compressFile(managerIdImageFile!)
        ]);

        formData.append('cover_image', compressedCover);
        formData.append('state_id', stateId);
        formData.append('lat', locationData.position!.lat.toString());
        formData.append('lng', locationData.position!.lng.toString());
        formData.append('map_desc', mapDesc);
        if (website) formData.append('website', website);
        if (whatsapp) formData.append('whatsapp', whatsapp);
        if (email) formData.append('email', email);
        formData.append('commercial_license', compressedLicense);
        formData.append('national_number_manager', nationalNumberManager);
        const { phone: mgrLocal } = splitPhone(phoneManager);
        formData.append('country_id_manager', String(phoneManagerCountryId));
        formData.append('phone_manager', mgrLocal);
        formData.append('manager_id_image', compressedManagerId);
        formData.append('description', description);
      }

      completeProfileMutation.mutate(formData);
    } catch (error) {
      toast.error(t('error_processing_images') || 'Error processing images. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  if (!userType) return null;

  const isPending = completeProfileMutation.isPending || isCompressing;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-brand-500/20 to-transparent rounded-[100%] blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6 mt-10">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-primary">{t('setup_profile') || 'Setup Profile'}</h1>
          <p className="text-sm text-secondary">{t('setup_profile_desc') || 'Complete your profile details'}</p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleCompleteProfile} className="space-y-4" noValidate>

            {/* Common: Profile Image */}
            <div className="flex flex-col items-center justify-center space-y-2" id="field-profileImage">
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
                    if (file) {
                      setProfileImageFile(file);
                      setProfileImagePreview(URL.createObjectURL(file));
                      clearError('profileImage');
                    }
                  }}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
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
              <span className="text-xs text-secondary">{t('profile_image') || 'Profile Image'} *</span>
              {errors.profileImage && <p className="text-xs text-red-500">{errors.profileImage}</p>}
            </div>

            {/* Common: Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {userType === '2' ? (t('business_name') || 'Business Name') : (t('full_name') || 'Full Name')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                  {userType === '2' ? <Building size={18} /> : <User size={18} />}
                </div>
                <input
                  id="field-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError('name');
                  }}
                  placeholder={t('name_placeholder') || 'Enter name'}
                  className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  required
                  minLength={3}
                  maxLength={255}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 px-1">{errors.name}</p>}
            </div>

            {/* Company Specific Fields */}
            {userType === '2' && (
              <>
                {/* Cover Image */}
                <div className="space-y-1.5" id="field-coverImage">
                  <label className="text-xs font-bold text-primary px-1">{t('banner_image') || 'Cover Image'} *</label>
                  <div
                    onClick={() => coverImageRef.current?.click()}
                    className="w-full h-32 rounded-xl bg-glass border-2 border-dashed border-border flex flex-col items-center justify-center text-secondary cursor-pointer hover:border-brand-400 transition-colors relative overflow-hidden group"
                  >
                    <input
                      type="file"
                      ref={coverImageRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverImageFile(file);
                          setCoverImagePreview(URL.createObjectURL(file));
                          clearError('coverImage');
                        }
                      }}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                    />
                    {coverImagePreview ? (
                      <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={24} className="mb-2 group-hover:text-brand-400 transition-colors" />
                        <span className="text-xs">{t('upload_banner') || 'Upload Cover Image'}</span>
                      </>
                    )}
                  </div>
                  {errors.coverImage && <p className="text-xs text-red-500 px-1">{errors.coverImage}</p>}
                </div>

                {/* State Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary px-1">{t('state') || 'State'} *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                      <MapPin size={18} />
                    </div>
                    <select
                      id="field-stateId"
                      value={stateId}
                      onChange={(e) => {
                        setStateId(e.target.value);
                        clearError('stateId');
                      }}
                      className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-10 text-sm text-primary focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none"
                      required
                    >
                      <option value="" disabled>{t('select_state') || 'Select State'}</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.stateId && <p className="text-xs text-red-500 px-1">{errors.stateId}</p>}
                </div>

                {/* Map Location */}
                <div id="field-location" className="space-y-1.5">
                  <LocationPicker
                    value={locationData}
                    onChange={(loc) => {
                      setLocationData(loc);
                      clearError('location');
                    }}
                    selectedStateName={states.find(s => s.id.toString() === stateId)?.name}
                  />
                  {errors.location && <p className="text-xs text-red-500 px-1">{errors.location}</p>}
                </div>

                {/* Map Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary px-1">{t('map_desc') || 'Address Details'} *</label>
                  <input
                    id="field-mapDesc"
                    type="text"
                    value={mapDesc}
                    onChange={(e) => {
                      setMapDesc(e.target.value);
                      clearError('mapDesc');
                    }}
                    placeholder='e.g. "الفروانيه شارع حبيب المناور "'
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                    maxLength={255}
                  />
                  {errors.mapDesc && <p className="text-xs text-red-500 px-1">{errors.mapDesc}</p>}
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary px-1">{t('website') || 'Website (Optional)'}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                      <Globe size={18} />
                    </div>
                    <input
                      id="field-website"
                      type="url"
                      value={website}
                      onChange={(e) => {
                        setWebsite(e.target.value);
                        clearError('website');
                      }}
                      placeholder="https://example.com"
                      className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 transition-all"
                      dir="ltr"
                    />
                  </div>
                  {errors.website && <p className="text-xs text-red-500 px-1">{errors.website}</p>}
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5" id="field-whatsapp">
                  <label className="text-xs font-bold text-primary px-1">{t('whatsapp') || 'WhatsApp (Optional)'}</label>
                  <div className="relative">
                    <PhoneInput
                      value={whatsapp}
                      onChange={(val) => {
                        setWhatsapp(val);
                        clearError('whatsapp');
                      }}
                      placeholder="XXXX XXXX"
                    />
                  </div>
                  {errors.whatsapp && <p className="text-xs text-red-500 px-1">{errors.whatsapp}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary px-1">{t('email') || 'Email (Optional)'}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                      <Mail size={18} />
                    </div>
                    <input
                      id="field-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError('email');
                      }}
                      placeholder="example@mail.com"
                      className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary transition-all"
                      dir="ltr"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 px-1">{errors.email}</p>}
                </div>

                {/* Commercial License */}
                <div className="space-y-1.5" id="field-commercialLicense">
                  <label className="text-xs font-bold text-primary px-1">{t('company_tax_id') || 'Commercial License File'} *</label>
                  <div
                    onClick={() => commercialLicenseRef.current?.click()}
                    className="w-full h-24 rounded-xl bg-glass border-2 border-dashed border-border flex flex-col items-center justify-center text-secondary cursor-pointer hover:border-brand-400 transition-colors relative overflow-hidden group"
                  >
                    <input
                      type="file"
                      ref={commercialLicenseRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCommercialLicenseFile(file);
                          if (file.type.startsWith('image/')) {
                            setCommercialLicensePreview(URL.createObjectURL(file));
                          } else {
                            setCommercialLicensePreview('pdf');
                          }
                          clearError('commercialLicense');
                        }
                      }}
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                    />
                    {commercialLicensePreview && commercialLicensePreview !== 'pdf' ? (
                      <img src={commercialLicensePreview} alt="License" className="w-full h-full object-cover" />
                    ) : commercialLicensePreview === 'pdf' ? (
                      <FileText size={24} className="text-brand-500" />
                    ) : (
                      <span className="text-xs">{t('upload_files') || 'Upload File'}</span>
                    )}
                  </div>
                  {errors.commercialLicense && <p className="text-xs text-red-500 px-1">{errors.commercialLicense}</p>}
                </div>

                {/* Manager National Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary px-1">{t('responsible_id') || 'Manager National Number'} *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                      <CreditCard size={18} />
                    </div>
                    <input
                      id="field-nationalNumberManager"
                      type="tel"
                      inputMode="numeric"
                      value={nationalNumberManager}
                      onChange={(e) => {
                        const digits = normalizeArabicNumbers(e.target.value).replace(/\D/g, '').slice(0, 12);
                        setNationalNumberManager(digits);
                        clearError('nationalNumberManager');
                      }}
                      className="w-full h-12 bg-background border border-border rounded-xl ps-10 pe-4 text-sm text-primary transition-all"
                      required
                      minLength={12}
                      maxLength={12}
                      dir="ltr"
                    />
                  </div>
                  {errors.nationalNumberManager && <p className="text-xs text-red-500 px-1">{errors.nationalNumberManager}</p>}
                </div>

                {/* Manager Phone */}
                <div className="space-y-1.5" id="field-phoneManager">
                  <label className="text-xs font-bold text-primary px-1">{t('responsible_number') || 'Manager Phone'} *</label>
                  <div className="relative">
                    <PhoneInput
                      value={phoneManager}
                      onChange={(val) => {
                        setPhoneManager(val);
                        clearError('phoneManager');
                      }}
                      onCountryChange={(c: ApiCountry) => setPhoneManagerCountryId(c.id)}
                      placeholder={t('responsible_number') || 'Responsible Number'}
                    />
                  </div>
                  {errors.phoneManager && <p className="text-xs text-red-500 px-1">{errors.phoneManager}</p>}
                </div>

                {/* Manager ID Image */}
                <div className="space-y-1.5" id="field-managerIdImage">
                  <label className="text-xs font-bold text-primary px-1">{t('responsible_id_file') || 'Manager ID Image'} *</label>
                  <div
                    onClick={() => managerIdImageRef.current?.click()}
                    className="w-full h-24 rounded-xl bg-glass border-2 border-dashed border-border flex flex-col items-center justify-center text-secondary cursor-pointer hover:border-brand-400 transition-colors relative overflow-hidden group"
                  >
                    <input
                      type="file"
                      ref={managerIdImageRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setManagerIdImageFile(file);
                          setManagerIdImagePreview(URL.createObjectURL(file));
                          clearError('managerIdImage');
                        }
                      }}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                    />
                    {managerIdImagePreview ? (
                      <img src={managerIdImagePreview} alt="ID" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">{t('upload_responsible_id') || 'Upload ID'}</span>
                    )}
                  </div>
                  {errors.managerIdImage && <p className="text-xs text-red-500 px-1">{errors.managerIdImage}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary px-1">{t('description') || 'Description'} *</label>
                  <textarea
                    id="field-description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearError('description');
                    }}
                    className="w-full min-h-[100px] bg-background border border-border rounded-xl p-4 text-sm text-primary transition-all resize-y"
                    required
                  />
                  {errors.description && <p className="text-xs text-red-500 px-1">{errors.description}</p>}
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm mt-6"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isCompressing ? t('processing') : t('saving')}</span>
                </div>
              ) : (
                t('complete_signup') || 'Complete Profile'
              )}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
