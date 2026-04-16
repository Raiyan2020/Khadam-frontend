import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './GlassUI';
import { useLanguage } from '../i18n';

export interface FilterCriteria {
  maxSalary?: number;
  language?: string;
  gender?: 'Female' | 'Male' | 'Any';
  minExperience?: number;
  maxAge?: number;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (criteria: FilterCriteria) => void;
  initialCriteria?: FilterCriteria;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, initialCriteria }) => {
  const { t } = useLanguage();
  
  const [maxSalary, setMaxSalary] = useState<number | ''>(initialCriteria?.maxSalary || '');
  const [language, setLanguage] = useState<string>(initialCriteria?.language || 'Any');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Any'>(initialCriteria?.gender || 'Any');
  const [minExperience, setMinExperience] = useState<number | ''>(initialCriteria?.minExperience || '');
  const [maxAge, setMaxAge] = useState<number | ''>(initialCriteria?.maxAge || '');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      maxSalary: maxSalary === '' ? undefined : Number(maxSalary),
      language: language === 'Any' ? undefined : language,
      gender: gender,
      minExperience: minExperience === '' ? undefined : Number(minExperience),
      maxAge: maxAge === '' ? undefined : Number(maxAge),
    });
    onClose();
  };

  const handleReset = () => {
    setMaxSalary('');
    setLanguage('Any');
    setGender('Any');
    setMinExperience('');
    setMaxAge('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:w-[400px] bg-black rounded-t-3xl sm:rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">{t('filter_title')}</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-5 space-y-5">
            {/* Salary */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('filter_salary')}</label>
              <input 
                type="number" 
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 200"
                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-400 focus:bg-zinc-900"
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('filter_languages')}</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-400 focus:bg-zinc-900 appearance-none"
              >
                <option value="Any">{t('any')}</option>
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
                <option value="Tagalog">Tagalog</option>
              </select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('filter_gender')}</label>
              <div className="flex gap-2">
                {(['Any', 'Female', 'Male'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${gender === g ? 'bg-brand-500 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
                  >
                    {g === 'Any' ? t('any') : g === 'Female' ? t('gender_female') : t('gender_male')}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('filter_experience')}</label>
              <input 
                type="number" 
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 2"
                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-400 focus:bg-zinc-900"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('filter_age')}</label>
              <input 
                type="number" 
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 35"
                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-400 focus:bg-zinc-900"
              />
            </div>
          </div>

          <div className="p-5 border-t border-zinc-800 flex gap-3">
            <Button variant="secondary" className="flex-1 !bg-zinc-800 !text-white hover:!bg-zinc-700 !border-zinc-700" onClick={handleReset}>
              {t('reset_filter')}
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              {t('apply_filters')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
