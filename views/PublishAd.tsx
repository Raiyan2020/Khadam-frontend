
import React, { useState, useEffect } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { ServiceCategory } from '../types';
import { useLanguage } from '../i18n';
import { MOCK_ADS, MOCK_WORKERS } from '../constants';

import { useNavigate } from '@tanstack/react-router';
import { useSearch } from '@tanstack/react-router';

export const PublishAd: React.FC = () => {
  const { adId } = useSearch({ strict: false }) as { adId?: string };
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { t, language } = useLanguage();

  const isEditing = !!adId;
  const ad = isEditing ? MOCK_ADS.find(a => a.id === adId) : null;
  const worker = ad ? MOCK_WORKERS.find(w => w.id === ad.workerId) : null;

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

  return (
    <div className="px-5 pt-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate({ to: '/my-ads' })} className="text-secondary hover:text-primary"><X size={24} /></button>
        <h1 className="text-2xl font-bold text-primary">{isEditing ? t('edit_ad') : t('new_listing')}</h1>
        <div className="w-6" /> {/* Spacer to keep title centered if needed, or just let it be */}
      </div>

      <div className="space-y-6">
        
        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
           {[1, 2, 3].map(i => (
             <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-glassHigh'}`} />
           ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-start-4 duration-300">
             <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-glass hover:bg-glassHigh transition-colors cursor-pointer text-center relative overflow-hidden">
                {worker?.photo ? (
                  <img src={worker.photo} alt="Worker" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                ) : null}
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-3 relative z-10">
                   <Upload size={24} />
                </div>
                <p className="text-sm font-medium text-primary relative z-10">{t('upload_photo')}</p>
                <p className="text-xs text-secondary mt-1 relative z-10">{t('upload_hint')}</p>
             </div>

             <div className="space-y-2">
               <label className="text-xs text-secondary ms-1">{t('select_category')}</label>
               <div className="grid grid-cols-2 gap-3">
                 {Object.values(ServiceCategory).map(cat => (
                   <div key={cat} className={`bg-surface border ${worker?.category === cat ? 'border-accent text-accent' : 'border-border text-secondary'} rounded-xl p-3 text-center text-sm font-medium hover:border-accent hover:text-accent cursor-pointer transition-colors`}>
                     {getTranslatedCategory(cat)}
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-start-4 duration-300">
             <InputGroup label={t('ad_title')} placeholder="e.g. Experienced Housekeeper..." defaultValue={ad?.title[language]} />
             <InputGroup label={t('worker_name')} placeholder={t('worker_name')} defaultValue={worker?.name[language]} />
             
             <div className="grid grid-cols-2 gap-4">
               <InputGroup label={t('nationality')} placeholder={t('nationality')} defaultValue={worker?.nationality[language]} />
               <InputGroup label={t('age')} placeholder="25" type="number" defaultValue={worker?.age?.toString()} />
             </div>
             
             <InputGroup label={t('short_desc')} placeholder={t('short_desc')} textarea defaultValue={ad?.description[language]} />
          </div>
        )}

        {step === 3 && (
           <div className="space-y-4 animate-in fade-in slide-in-from-start-4 duration-300">
             <div className="grid grid-cols-2 gap-4">
                <InputGroup label={`${t('experience')} (${t('exp_years')})`} placeholder="2" type="number" defaultValue={worker?.experienceYears?.toString()} />
                <InputGroup label={`${t('salary')} (KWD)`} placeholder="120" type="number" defaultValue={worker?.salary?.toString()} />
             </div>
             
             <InputGroup label={t('contact_phone')} placeholder="965 XXXXXXXX" defaultValue="965 12345678" />
             
             <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 mt-4">
                <Check size={20} className="text-green-500 mt-0.5" />
                <div>
                   <p className="text-sm font-medium text-green-600 dark:text-green-300">{t('ready_publish')}</p>
                   <p className="text-xs text-green-600/60 dark:text-green-300/60 mt-0.5">{t('ready_publish_desc')}</p>
                </div>
             </div>
           </div>
        )}

        <div className="pt-4 flex gap-3">
           {step > 1 && (
             <Button variant="secondary" className="flex-1" onClick={() => setStep(s => s - 1)}>
               {t('go_back')}
             </Button>
           )}
           {step < 3 ? (
             <Button className="flex-1" onClick={() => setStep(s => s + 1)}>{t('next_step')}</Button>
           ) : (
             <Button className="flex-1" onClick={() => navigate({ to: '/my-ads' })}>{isEditing ? t('save_changes') : t('publish_now')}</Button>
           )}
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
