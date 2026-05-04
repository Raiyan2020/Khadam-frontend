import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Skeleton } from './GlassUI';
import { useLanguage } from '../i18n';
import { NATIONALITIES, LANGUAGES } from '../constants';
import { useCountries } from '../features/auth/hooks/useCountries';
import { useCategories } from '../features/auth/hooks/useCategories';
import { useLanguages } from '../features/auth/hooks/useLanguages';

export interface FilterCriteria {
  maxSalary?: number;
  category?: number;
  nationality?: string;   // display name
  country_id?: number;   // API payload
  gender?: 'Female' | 'Male' | 'Any';
  minExperience?: number;
  maxAge?: number;
  languages?: number[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (criteria: FilterCriteria) => void;
  initialCriteria?: FilterCriteria;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, initialCriteria }) => {
  const { t, language } = useLanguage();
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: languagesData, isLoading: isLoadingLanguages } = useLanguages();

  const [maxSalary, setMaxSalary] = useState<number | ''>(initialCriteria?.maxSalary || '');
  const [category, setCategory] = useState<number | 'Any'>(initialCriteria?.category || 'Any');
  const [nationality, setNationality] = useState<string>(initialCriteria?.nationality || 'Any');
  const [countryId, setCountryId] = useState<number | undefined>(initialCriteria?.country_id);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Any'>(initialCriteria?.gender || 'Any');
  const [minExperience, setMinExperience] = useState<number | ''>(initialCriteria?.minExperience || '');
  const [maxAge, setMaxAge] = useState<number | ''>(initialCriteria?.maxAge || '');
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>(initialCriteria?.languages || []);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      maxSalary: maxSalary === '' ? undefined : Number(maxSalary),
      category: category === 'Any' ? undefined : Number(category),
      nationality: nationality === 'Any' ? undefined : nationality,
      country_id: nationality === 'Any' ? undefined : countryId,
      gender: gender,
      minExperience: minExperience === '' ? undefined : Number(minExperience),
      maxAge: maxAge === '' ? undefined : Number(maxAge),
      languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setMaxSalary('');
    setCategory('Any');
    setNationality('Any');
    setCountryId(undefined);
    setGender('Any');
    setMinExperience('');
    setMaxAge('');
    setSelectedLanguages([]);
  };

  return (
    <div className="fixed h-screen inset-0 z-50 overflow-y-auto !mt-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full   max-h-[70dvh] no-scrollbar overflow-y-auto relative sm:w-[400px] bg-black rounded-t-3xl sm:rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 sm:pb-0 pb-20">
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

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('select_category')}</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">

                {isLoadingCategories ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-xl" />
                  ))
                ) : (
                  categories?.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex-shrink-0 h-10 px-4 rounded-xl text-sm font-medium transition-colors ${category === cat.id ? 'bg-brand-500 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('nationality')}</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">

                {isLoadingCountries ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-xl" />
                  ))
                ) : (
                  countries?.map(nat => (
                    <button
                      key={nat.id}
                      onClick={() => {
                        setNationality(nat.name);
                        setCountryId(nat.id);
                      }}
                      className={`flex-shrink-0 h-10 px-3 flex items-center gap-2 rounded-xl text-sm font-medium transition-colors ${nationality === nat.name ? 'bg-brand-500 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
                    >
                      <img src={nat.image} alt={nat.name} className="w-5 h-5 rounded-full object-cover" />
                      <span>{nat.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">{t('filter_languages')}</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {isLoadingLanguages ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-xl" />
                  ))
                ) : (
                  languagesData?.map(lang => {
                    const isSelected = selectedLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setSelectedLanguages(prev =>
                            isSelected ? prev.filter(id => id !== lang.id) : [...prev, lang.id]
                          );
                        }}
                        className={`flex-shrink-0 h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${isSelected
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                          }`}
                      >
                        {lang.name}
                      </button>
                    );
                  })
                )}
              </div>
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

          <div className="sticky bottom-0 bg-black/10 backdrop-blur-sm p-5 border-t border-zinc-800 flex gap-3">
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
