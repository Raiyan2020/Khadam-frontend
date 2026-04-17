import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../components/GlassUI';
import { ServiceCategory } from '../types';
import { useLanguage } from '../i18n';
import { MOCK_ADS, MOCK_WORKERS } from '../constants';

import { useNavigate, useParams } from '@tanstack/react-router';

export const EditAd: React.FC = () => {
  const { adId } = useParams({ strict: false }) as { adId: string };
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const ad = MOCK_ADS.find(a => a.id === adId);
  const worker = MOCK_WORKERS.find(w => w.id === ad?.workerId);

  const getTranslatedCategory = (cat: ServiceCategory) => {
    switch (cat) {
      case ServiceCategory.BABYSITTER: return t('cat_babysitter');
      case ServiceCategory.COOK_FEMALE: return t('cat_cook_female');
      case ServiceCategory.NURSE: return t('cat_nurse');
      case ServiceCategory.DRIVER: return t('cat_driver');
      case ServiceCategory.COOK_MALE: return t('cat_cook_male');
      case ServiceCategory.DOMESTIC_WORKER: return t('cat_domestic_worker');
      default: return cat;
    }
  };

  if (!ad || !worker) return <div className="p-10 text-center">Ad not found</div>;

  return (
    <div className="px-5 pt-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate({ to: '/my-ads' })} className="text-secondary hover:text-primary"><X size={24} /></button>
        <h1 className="text-2xl font-bold text-primary">{t('edit_ad')}</h1>
        <div className="w-6" />
      </div>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Photo Upload */}
        <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-glass hover:bg-glassHigh transition-colors cursor-pointer text-center relative overflow-hidden">
          <img src={worker.photo} alt="Current" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-3">
              <Upload size={24} />
            </div>
            <p className="text-sm font-medium text-primary">{t('upload_photo')}</p>
            <p className="text-xs text-secondary mt-1">{t('upload_hint')}</p>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs text-secondary ms-1">{t('select_category')}</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(ServiceCategory).map(cat => (
              <div
                key={cat}
                className={`bg-surface border rounded-xl p-3 text-center text-sm font-medium cursor-pointer transition-colors ${worker.category === cat
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border text-secondary hover:border-accent hover:text-accent'
                  }`}
              >
                {getTranslatedCategory(cat)}
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        {/* <InputGroup label={t('ad_title')} placeholder="e.g. Experienced Housekeeper..." defaultValue={ad.title[language]} /> */}
        <InputGroup label={t('worker_name')} placeholder={t('worker_name')} defaultValue={worker.name[language]} />

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={t('nationality')} placeholder={t('nationality')} defaultValue={worker.nationality[language]} />
          <InputGroup label={t('age')} placeholder="25" type="number" defaultValue={worker.age.toString()} />
        </div>

        <InputGroup label={t('short_desc')} placeholder={t('short_desc')} textarea defaultValue={ad.description[language]} />

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={`${t('experience')} (${t('exp_years')})`} placeholder="2" type="number" defaultValue={worker.experienceYears.toString()} />
          <InputGroup label={`${t('salary')} (KWD)`} placeholder="120" type="number" defaultValue={worker.salary.toString()} />
        </div>

        <InputGroup label={t('contact_phone')} placeholder="965 XXXXXXXX" defaultValue="965 12345678" />

        <div className="pt-4">
          <Button fullWidth onClick={() => navigate({ to: '/my-ads' })}>{t('save_changes')}</Button>
        </div>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string; placeholder: string; type?: string; textarea?: boolean; defaultValue?: string }> = ({ label, placeholder, type = 'text', textarea, defaultValue }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-secondary ms-1">{label}</label>
    {textarea ? (
      <textarea
        className="w-full h-24 bg-glass border border-border rounded-xl p-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/50 focus:bg-glassHigh resize-none"
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    ) : (
      <input
        type={type}
        className="w-full h-12 bg-glass border border-border rounded-xl px-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/50 focus:bg-glassHigh"
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    )}
  </div>
);
