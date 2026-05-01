import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, ChevronDown, Loader2 } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { useNavigate, useParams } from '@tanstack/react-router';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCategories } from '../features/auth/hooks/useCategories';
import { useCountries } from '../features/auth/hooks/useCountries';
import { useLanguages } from '../features/auth/hooks/useLanguages';
import { useAdDetail, useUpdateAd, UpdateAdPayload } from '../features/auth/hooks/useEditAd';
import imageCompression from 'browser-image-compression';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const getAdSchema = (t: any) => z.object({
  image: z.instanceof(File).optional().nullable(),
  category_id: z.number({ message: t('v_category_required') }).min(1, t('v_category_required')),
  title: z.string().min(3, t('v_title_min')).max(255, t('v_title_max')),
  worker_name: z.string().min(3, t('v_worker_name_min')).max(255, t('v_worker_name_max')),
  country_id: z.number({ message: t('v_nationality_required') }).min(1, t('v_nationality_required')),
  age: z.number({ message: t('v_age_required') }).min(1, t('v_age_min')).max(100, t('v_age_max')),
  description: z.string().min(3, t('v_description_min')).max(500, t('v_description_max')),
  years_experience: z.number().min(0, t('v_experience_min')).max(100, t('v_experience_max')),
  salary: z.number().min(0, t('v_salary_min')).max(1000000, t('v_salary_max')),
  is_available: z.boolean(),
  gender: z.enum(['male', 'female'], { message: t('v_gender_required') }),
  languages: z.array(z.number()).min(1, t('v_languages_min')),
});

export const EditAd: React.FC = () => {
  const { adId } = useParams({ strict: false }) as { adId: string };
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: adData, isLoading: loadingDetail } = useAdDetail(adId);
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const { data: languages, isLoading: loadingLangs } = useLanguages();
  const updateAd = useUpdateAd();

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
  const [isCompressing, setIsCompressing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // Initialize form with fetched data
  useEffect(() => {
    if (adData) {
      setTitle(adData.title || '');
      setWorkerName(adData.worker_name || '');
      setAge(String(adData.age || ''));
      setDescription(adData.description || '');
      setYearsExperience(String(adData.years_experience || ''));
      setSalary(String(adData.salary || ''));
      setIsAvailable(adData.is_available === 1);
      
      // Map gender string to enum
      if (adData.gender?.includes('انثى') || adData.gender?.toLowerCase() === 'female') {
        setGender('female');
      } else if (adData.gender?.includes('ذكر') || adData.gender?.toLowerCase() === 'male') {
        setGender('male');
      }
      
      setSelectedLanguages(adData.languages?.map(l => l.id) || []);
      setImagePreview(adData.image || null);
    }
  }, [adData]);

  // Try to find category and country IDs by name if they are not in the initial payload
  useEffect(() => {
    if (adData && categories && !categoryId) {
      const cat = categories.find(c => c.name === adData.category_name);
      if (cat) setCategoryId(cat.id);
    }
    if (adData && countries && !countryId) {
      const country = countries.find(c => c.name === adData.country_name);
      if (country) setCountryId(country.id);
    }
  }, [adData, categories, countries, categoryId, countryId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleLanguage = (id: number) => {
    setSelectedLanguages(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const payload = {
      id: Number(adId),
      image: imageFile,
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
    };

    const schema = getAdSchema(t);
    const result = schema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsCompressing(true);
    try {
      if (imageFile) {
        payload.image = await compressFile(imageFile);
      }

      updateAd.mutate(payload as UpdateAdPayload, {
        onSuccess: () => {
          navigate({ to: '/my-ads' });
        },
      });
    } catch (error) {
      toast.error(t('error_processing_images') || 'Error processing image');
    } finally {
      setIsCompressing(false);
    }
  };

  if (loadingDetail) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate({ to: '/my-ads' })} className="text-secondary hover:text-primary transition-colors">
          <X size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">{t('edit_ad')}</h1>
        <div className="w-6" />
      </div>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Photo Upload */}
        <div
          onClick={() => imageInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-glass hover:bg-glassHigh transition-colors cursor-pointer text-center relative overflow-hidden"
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                  <Upload size={24} className="text-white" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-3">
                <Upload size={24} />
              </div>
              <p className="text-sm font-medium text-primary">{t('upload_photo')}</p>
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

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs text-secondary ms-1">{t('select_category')}</label>
          {loadingCats ? (
            <div className="grid grid-cols-2 gap-3 h-12 bg-glass animate-pulse rounded-xl" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`border rounded-xl p-3 text-center text-sm font-medium transition-all duration-200 ${
                    categoryId === cat.id
                      ? 'border-accent text-accent bg-accent/10'
                      : 'bg-glass border-border text-secondary hover:border-accent/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <InputGroup label={t('ad_title')} placeholder={t('ph_ad_title')} value={title} onChange={setTitle} />
        <InputGroup label={t('worker_name')} placeholder={t('ph_worker_name')} value={workerName} onChange={setWorkerName} />

        <div className="grid grid-cols-2 gap-4">
          {/* Nationality */}
          <div className="space-y-1.5">
            <label className="text-xs text-secondary ms-1">{t('nationality')}</label>
            <div className="relative">
              <select
                value={countryId || ''}
                onChange={e => setCountryId(Number(e.target.value))}
                className="w-full h-12 bg-glass border border-border rounded-xl px-3 pe-10 text-sm text-primary appearance-none focus:outline-none focus:border-accent/50 focus:bg-glassHigh"
              >
                <option value="">{t('ph_select_nationality')}</option>
                {countries?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
          </div>
          <InputGroup label={t('age')} placeholder={t('ph_age')} type="number" value={age} onChange={setAge} />
        </div>

        <InputGroup label={t('short_desc')} placeholder={t('ph_description')} textarea value={description} onChange={setDescription} />

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={`${t('experience')} (${t('exp_years')})`} placeholder={t('ph_experience')} type="number" value={yearsExperience} onChange={setYearsExperience} />
          <InputGroup label={`${t('salary')} (KWD)`} placeholder={t('ph_salary')} type="number" value={salary} onChange={setSalary} />
        </div>

        {/* Gender & Availability */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-secondary ms-1">{t('gender')}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`h-12 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    gender === g
                      ? 'border-accent text-accent bg-accent/10'
                      : 'bg-glass border-border text-secondary hover:border-accent/50'
                  }`}
                >
                  {g === 'male' ? t('gender_male') : t('gender_female')}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-secondary ms-1">{t('available')}</label>
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => setIsAvailable(val)}
                  className={`h-12 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    isAvailable === val
                      ? 'border-accent text-accent bg-accent/10'
                      : 'bg-glass border-border text-secondary hover:border-accent/50'
                  }`}
                >
                  {val ? t('available') : t('reserved')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <label className="text-xs text-secondary ms-1">{t('languages')}</label>
          <div className="flex flex-wrap gap-2">
            {languages?.map(lang => (
              <button
                key={lang.id}
                onClick={() => toggleLanguage(lang.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  selectedLanguages.includes(lang.id)
                    ? 'border-accent text-accent bg-accent/10'
                    : 'bg-glass border-border text-secondary hover:border-accent/50'
                }`}
              >
                {selectedLanguages.includes(lang.id) && <Check size={10} className="inline me-1" />}
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button fullWidth onClick={handleSubmit} disabled={updateAd.isPending || isCompressing}>
            {updateAd.isPending || isCompressing ? (
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isCompressing ? t('processing') : t('saving')}</span>
              </div>
            ) : t('save_changes')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{
  label: string;
  placeholder: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, placeholder, type = 'text', textarea, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-secondary ms-1">{label}</label>
    {textarea ? (
      <textarea
        className="w-full h-24 bg-glass border border-border rounded-xl p-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/50 focus:bg-glassHigh resize-none"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    ) : (
      <input
        type={type}
        className="w-full h-12 bg-glass border border-border rounded-xl px-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/50 focus:bg-glassHigh"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    )}
  </div>
);
