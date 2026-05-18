import React, { useState, useRef } from 'react';
import { Upload, X, Check, ChevronDown, Loader2, Image as ImageIcon, Crown, Zap } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCategories } from '../features/auth/hooks/useCategories';
import { useCountries } from '../features/auth/hooks/useCountries';
import { useLanguages } from '../features/auth/hooks/useLanguages';
import { useStoreAd } from '../features/auth/hooks/useStoreAd';
import { useProfile } from '../features/auth/hooks/useProfile';
import { normalizeArabicNumbers } from '../lib/numbers';
import { normalizeImageForUpload } from '../lib/imageUtils';

// ─── Zod Schemas per step ─────────────────────────────────────────────────────
const getStep1Schema = (t: any) =>
  z.object({
    image: z.instanceof(File, { message: t('v_image_required') }),
    category_id: z.number({ message: t('v_category_required') }).min(1, t('v_category_required')),
  });

const getStep2Schema = (t: any) =>
  z.object({
    title: z.string().min(3, t('v_title_min')).max(255, t('v_title_max')),
    worker_name: z.string().min(3, t('v_worker_name_min')).max(255, t('v_worker_name_max')),
    country_id: z.number({ message: t('v_nationality_required') }).min(1, t('v_nationality_required')),
    age: z.number({ message: t('v_age_required') }).min(1, t('v_age_min')).max(99, t('v_age_max')),
    description: z.string().min(3, t('v_description_min')).max(500, t('v_description_max')),
    gender: z.enum(['male', 'female'], { message: t('v_gender_required') }),
  });

const getStep3Schema = (t: any, maxExperience: number) =>
  z.object({
    languages: z.array(z.number()).min(1, t('v_languages_min')),
    years_experience: z.number().min(0, t('v_experience_min')).max(maxExperience, `${t('v_experience_max') || 'Max experience'} ${maxExperience}`),
    salary: z.number().min(0, t('v_salary_min')).max(1000000, t('v_salary_max')),
  });

// ─── Component ───────────────────────────────────────────────────────────────
export const PublishAd: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  // step 0 = subscription gate, steps 1-3 = ad form
  const [step, setStep] = useState(0);
  const [isSingleAd, setIsSingleAd] = useState(false);

  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const { data: languages, isLoading: loadingLangs } = useLanguages();
  const storeAd = useStoreAd();

  // Auto-skip the subscription gate if the user is already subscribed
  React.useEffect(() => {
    if (!loadingProfile && profile?.is_subscribed && step === 0) {
      setIsSingleAd(false);
      setStep(1);
    }
  }, [loadingProfile, profile?.is_subscribed]);

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [countryId, setCountryId] = useState<number>(0);
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);

  // Per-field error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // Close country dropdown on outside click
  React.useEffect(() => {
    if (!countryDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [countryDropdownOpen]);

  // Clear a specific field error when the user edits it
  const clearError = (key: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  // ── Image handler ──────────────────────────────────────────────────────────
  // iOS delivers HEIC camera photos where file.size may report 0.
  // normalizeImageForUpload uses fetch(objectURL) to force the real data read.
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearError('image');
    try {
      const jpegFile = await normalizeImageForUpload(file);
      setImageFile(jpegFile);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(jpegFile);
    } catch (err: any) {
      // If the file genuinely has bytes, use it as-is (non-iOS case)
      if (file.size > 0) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }
      // File is truly empty — iOS didn't finish loading it. Ask the user to retry.
      toast.error(
        t('image_load_failed') ||
        'فشل تحميل الصورة. يرجى إغلاق التطبيق وإعادة المحاولة.',
      );
    }
  };


  const toggleLanguage = (id: number) => {
    setSelectedLanguages(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
    clearError('languages');
  };

  // ── Step validation via Zod ─────────────────────────────────────────────────
  const validateStep = (currentStep: number): boolean => {
    let result: { success: true; data: any } | { success: false; error: z.ZodError };

    if (currentStep === 1) {
      result = getStep1Schema(t).safeParse({
        image: imageFile,
        category_id: categoryId,
      });
    } else if (currentStep === 2) {
      result = getStep2Schema(t).safeParse({
        title,
        worker_name: workerName,
        country_id: countryId,
        age: age ? Number(age) : undefined,
        description,
        gender: gender || undefined,
      });
    } else {
      const maxExp = age ? Math.max(0, Number(age) - 10) : 100;
      result = getStep3Schema(t, maxExp).safeParse({
        languages: selectedLanguages,
        years_experience: yearsExperience ? Number(yearsExperience) : 0,
        salary: salary ? Number(salary) : 0,
      });
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validateStep(3)) return;

    const payload = {
      image: imageFile as File,
      category_id: categoryId,
      title,
      worker_name: workerName,
      country_id: countryId,
      age: Number(age),
      description,
      years_experience: Number(yearsExperience) || 0,
      salary: Number(salary) || 0,
      is_available: isAvailable,
      gender: gender as 'male' | 'female',
      languages: selectedLanguages,
      is_single_ad: isSingleAd,
    };

    storeAd.mutate(payload, {
      onSuccess: (data) => {
        if (data.data?.payment_url) {
          toast.success(t('payment_redirect'));
          window.location.href = data.data.payment_url;
        } else {
          toast.success(data.message || 'Ad published successfully!');
          navigate({ to: '/my-ads' });
        }
      },
    });
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate({ to: '/my-ads' })} className="text-secondary hover:text-primary transition-colors">
          <X size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">{t('new_listing')}</h1>
        <div className="w-6" />
      </div>

      <div className="space-y-6">
        {/* Step Indicator — only shown for steps 1-3 */}
        {step > 0 && (
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-accent' : 'bg-glassHigh'}`} />
            ))}
          </div>
        )}

        {/* ── Step 0: Subscription Gate ── */}
        {step === 0 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-sm text-secondary">{t('loading') || 'Loading...'}</p>
              </div>
            ) : (
              // User is NOT subscribed — show options
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold text-primary">{t('choose_publish_method') || 'How would you like to publish?'}</h2>
                  <p className="text-sm text-secondary">{t('choose_publish_method_desc') || 'Select a publishing option to continue'}</p>
                </div>

                {/* Single Ad Option */}
                <button
                  onClick={() => { setIsSingleAd(true); setStep(1); }}
                  className="w-full text-start p-5 rounded-2xl bg-glass border border-border hover:border-accent/60 hover:bg-accent/5 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Zap size={22} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">{t('single_ad') || 'Single Ad'}</p>
                      <p className="text-xs text-secondary mt-0.5">{t('single_ad_desc') || 'Publish one ad without a subscription'}</p>
                    </div>
                  </div>
                </button>

                {/* Subscriptions Option */}
                <button
                  onClick={() => navigate({ to: '/subscriptions' })}
                  className="w-full text-start p-5 rounded-2xl bg-glass border border-border hover:border-accent/60 hover:bg-accent/5 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Crown size={22} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">{t('view_subscriptions') || 'View Subscriptions'}</p>
                      <p className="text-xs text-secondary mt-0.5">{t('view_subscriptions_desc') || 'Get unlimited ads with a subscription plan'}</p>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        )}


        {/* ── Step 1: Image & Category ── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-start-4 duration-300">
            {/* Image Upload */}
            <div>
              <p className="text-xs text-secondary ms-1 mb-1.5">{t('upload_photo')}</p>
              <div
                onClick={() => imageInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center bg-glass hover:bg-glassHigh transition-colors cursor-pointer text-center relative overflow-hidden ${errors.image ? 'border-red-500/60' : 'border-border'}`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                        <ImageIcon size={24} className="text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-primary">{t('upload_photo')}</p>
                    <p className="text-xs text-secondary mt-1">{t('upload_hint')}</p>
                  </>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {errors.image && <FieldError message={errors.image} />}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs text-secondary ms-1">{t('select_category')}</label>
              {loadingCats ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-glass animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categories?.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategoryId(cat.id); clearError('category_id'); }}
                      className={`border rounded-xl p-3 text-center text-sm font-medium transition-all duration-200 ${categoryId === cat.id
                        ? 'border-accent text-accent bg-accent/10'
                        : errors.category_id
                          ? 'bg-glass border-red-500/50 text-secondary'
                          : 'bg-glass border-border text-secondary hover:border-accent/50'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
              {errors.category_id && <FieldError message={errors.category_id} />}
            </div>
          </div>
        )}

        {/* ── Step 2: Worker Details ── */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-start-4 duration-300">
            <InputGroup
              label={t('ad_title')}
              placeholder={t('ph_ad_title')}
              value={title}
              error={errors.title}
              onChange={v => { setTitle(v); clearError('title'); }}
            />
            <InputGroup
              label={t('worker_name')}
              placeholder={t('ph_worker_name')}
              value={workerName}
              error={errors.worker_name}
              onChange={v => { setWorkerName(v); clearError('worker_name'); }}
            />

            {/* Nationality custom dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs text-secondary ms-1">{t('nationality')}</label>
              <div className="relative" ref={countryDropdownRef}>
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(o => !o)}
                  className={`w-full h-12 bg-glass border rounded-xl px-3 pe-10 text-sm text-start flex items-center transition-colors ${errors.country_id
                    ? 'border-red-500/60'
                    : countryDropdownOpen
                      ? 'border-accent/50 bg-glassHigh'
                      : 'border-border'
                    } ${countryId ? 'text-primary' : 'text-secondary'}`}
                >
                  <span className="flex-1 truncate">
                    {countryId
                      ? countries?.find(c => c.id === countryId)?.name
                      : (loadingCountries ? t('loading') : t('ph_select_nationality'))}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`absolute end-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Options list — rendered in-flow, no OS popup */}
                {countryDropdownOpen && (
                  <div className="absolute z-50 start-0 end-0 top-[calc(100%+4px)] bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-xl overflow-hidden">
                    <div className="max-h-52 overflow-y-auto">
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-sm text-start text-secondary hover:bg-glassHigh transition-colors"
                        onClick={() => { setCountryId(0); clearError('country_id'); setCountryDropdownOpen(false); }}
                      >
                        {t('ph_select_nationality')}
                      </button>
                      {countries?.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className={`w-full px-4 py-2.5 text-sm text-start transition-colors ${countryId === c.id
                            ? 'bg-accent/20 text-accent-text font-semibold'
                            : 'text-primary hover:bg-glassHigh'
                            }`}
                          onClick={() => { setCountryId(c.id); clearError('country_id'); setCountryDropdownOpen(false); }}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.country_id && <FieldError message={errors.country_id} />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label={t('age')}
                placeholder={t('ph_age')}
                type="tel"
                value={age}
                error={errors.age}
                onChange={(val) => {
                  clearError('age');
                  const cleaned = normalizeArabicNumbers(val);
                  if (!cleaned) { setAge(''); setYearsExperience(''); return; }
                  const num = parseInt(cleaned, 10);
                  if (num <= 99) {
                    setAge(num.toString());
                    // Clamp experience to (age - 10)
                    const maxExp = Math.max(0, num - 10);
                    if (yearsExperience && Number(yearsExperience) > maxExp) {
                      setYearsExperience(maxExp.toString());
                      clearError('years_experience');
                    }
                  }
                }}
              />
              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs text-secondary ms-1">{t('gender')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['male', 'female'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => { setGender(g); clearError('gender'); }}
                      className={`h-12 rounded-xl text-sm font-medium border transition-all duration-200 ${gender === g
                        ? 'border-accent text-accent bg-accent/10'
                        : errors.gender
                          ? 'bg-glass border-red-500/50 text-secondary'
                          : 'bg-glass border-border text-secondary hover:border-accent/50'
                        }`}
                    >
                      {g === 'male' ? t('gender_male') : t('gender_female')}
                    </button>
                  ))}
                </div>
                {errors.gender && <FieldError message={errors.gender} />}
              </div>
            </div>

            <InputGroup
              label={t('short_desc')}
              placeholder={t('ph_description')}
              textarea
              value={description}
              error={errors.description}
              onChange={v => { setDescription(v); clearError('description'); }}
            />
          </div>
        )}

        {/* ── Step 3: Experience, Salary, Languages ── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-start-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label={`${t('experience')} (${t('exp_years')})${age ? ` · max ${Math.max(0, Number(age) - 10)}` : ''}`}
                placeholder={t('ph_experience')}
                type="tel"
                value={yearsExperience}
                error={errors.years_experience}
                onChange={v => {
                  const cleaned = normalizeArabicNumbers(v);
                  const maxExp = age ? Math.max(0, Number(age) - 10) : 100;
                  const num = Number(cleaned);
                  if (cleaned === '' || num <= maxExp) {
                    setYearsExperience(cleaned);
                    clearError('years_experience');
                  }
                }}
              />
              <InputGroup
                label={`${t('salary')} (KWD)`}
                placeholder={t('ph_salary')}
                type="tel"
                value={salary}
                error={errors.salary}
                onChange={v => { setSalary(normalizeArabicNumbers(v)); clearError('salary'); }}
              />
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-xs text-secondary ms-1">{t('available')}</label>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map(val => (
                  <button
                    key={String(val)}
                    onClick={() => setIsAvailable(val)}
                    className={`h-12 rounded-xl text-sm font-medium border transition-all duration-200 ${isAvailable === val
                      ? 'border-accent text-accent bg-accent/10'
                      : 'bg-glass border-border text-secondary hover:border-accent/50'
                      }`}
                  >
                    {val ? t('available') : t('reserved')}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="text-xs text-secondary ms-1">{t('languages')}</label>
              {loadingLangs ? (
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-20 rounded-xl bg-glass animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className={`flex flex-wrap gap-2 p-3 rounded-xl border transition-colors ${errors.languages ? 'border-red-500/40 bg-red-500/5' : 'border-transparent'}`}>
                  {languages?.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => toggleLanguage(lang.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${selectedLanguages.includes(lang.id)
                        ? 'border-accent text-accent bg-accent/10'
                        : 'bg-glass border-border text-secondary hover:border-accent/50'
                        }`}
                    >
                      {selectedLanguages.includes(lang.id) && <Check size={10} className="inline me-1" />}
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
              {errors.languages && <FieldError message={errors.languages} />}
            </div>

            {/* Ready summary */}
            <GlassCard className="p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300">{t('ready_publish')}</p>
                  <p className="text-xs text-green-600/60 dark:text-green-300/60 mt-0.5">{t('ready_publish_desc')}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Navigation Buttons */}
        {step > 0 && (
          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setStep(s => s - 1); setErrors({}); }}>
              {t('go_back')}
            </Button>
            {step < 3 ? (
              <Button className="flex-1" onClick={handleNext}>
                {t('next_step')}
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={storeAd.isPending}
              >
                {storeAd.isPending
                  ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  : t('publish_now')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FieldError: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-xs text-red-500 mt-1 ms-1 animate-in fade-in slide-in-from-top-1 duration-200">{message}</p>
);

const InputGroup: React.FC<{
  label: string;
  placeholder: string;
  type?: string;
  textarea?: boolean;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}> = ({ label, placeholder, type = 'text', textarea, value, error, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-secondary ms-1">{label}</label>
    {textarea ? (
      <textarea
        className={`w-full h-24 bg-glass border rounded-xl p-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:bg-glassHigh resize-none transition-colors ${error ? 'border-red-500/60 focus:border-red-500/60' : 'border-border focus:border-accent/50'}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    ) : (
      <input
        type={type}
        className={`w-full h-12 bg-glass border rounded-xl px-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:bg-glassHigh transition-colors ${error ? 'border-red-500/60 focus:border-red-500/60' : 'border-border focus:border-accent/50'}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    )}
    {error && <FieldError message={error} />}
  </div>
);
