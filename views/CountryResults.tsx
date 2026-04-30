import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Heart } from 'lucide-react';
import { Worker, Ad, ServiceCategory } from '../types';
import { MOCK_WORKERS, MOCK_OFFICES, MOCK_ADS, NATIONALITIES } from '../constants';
import { useLanguage } from '../i18n';
import { useFavorites } from '../FavoritesContext';
import { GlassCard, Badge, Avatar, SearchInput } from '../components/GlassUI';

import { useNavigate, useParams } from '@tanstack/react-router';
import { FilterModal, FilterCriteria } from '../components/FilterModal';
import { useCategories } from '../features/auth/hooks/useCategories';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png';
  e.currentTarget.className += ' grayscale opacity-30 object-contain p-4';
};

export const CountryResults: React.FC = () => {
  const { nationality } = useParams({ strict: false }) as { nationality: string };
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();

  const { data: categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({});

  // Sync category filter if activeCategory changes
  useEffect(() => {
    if (activeCategory !== 'All' && categories) {
      const catObj = categories.find(c => c.name === activeCategory);
      if (catObj) setFilters(prev => ({ ...prev, category: catObj.id }));
    } else if (activeCategory === 'All') {
      setFilters(prev => ({ ...prev, category: undefined }));
    }
  }, [activeCategory, categories]);

  const results = useMemo(() => {
    let filtered = MOCK_WORKERS.filter(w => w.nationality.en === nationality);

    if (activeCategory !== 'All') {
      filtered = filtered.filter(w => w.category === activeCategory);
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.name[language].toLowerCase().includes(searchLower) ||
        w.specialty[language].toLowerCase().includes(searchLower)
      );
    }

    // Apply Modal Filters
    if (filters.maxSalary) {
      filtered = filtered.filter(w => w.salary <= filters.maxSalary!);
    }
    if (filters.gender && filters.gender !== 'Any') {
      filtered = filtered.filter(w => w.gender === filters.gender);
    }
    if (filters.minExperience) {
      filtered = filtered.filter(w => w.experienceYears >= filters.minExperience!);
    }
    if (filters.maxAge) {
      filtered = filtered.filter(w => w.age <= filters.maxAge!);
    }
    if (filters.nationality && filters.nationality !== 'Any') {
      filtered = filtered.filter(w => w.nationality[language] === filters.nationality);
    }
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter(w =>
        filters.languages!.every(lang => w.languages.some(l => l.en === lang))
      );
    }

    return filtered;
  }, [nationality, activeCategory, searchQuery, language, filters]);

  const nationalityObj = NATIONALITIES.find(n => n.name.en === nationality);
  const title = nationalityObj ? nationalityObj.name[language] : nationality;

  const getTranslatedCategory = (cat: ServiceCategory | 'All') => {
    if (cat === 'All') return t('cat_all');
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
    <div className="pb-10 min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
          >
            {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="flex items-center gap-3">
            {nationalityObj && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                <img src={nationalityObj.flag} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-xl font-bold text-primary">{title}</h1>
          </div>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(newFilters) => setFilters(newFilters)}
          initialCriteria={filters}
        />

        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          <CategoryChip
            label={t('cat_all')}
            isActive={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
          />
          {Object.values(ServiceCategory).map(cat => (
            <CategoryChip
              key={cat}
              label={getTranslatedCategory(cat)}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-secondary">
          {results.length} {t('results_found')}
        </p>

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map(worker => (
              <FullListingCard
                key={worker.id}
                worker={worker}
                onSelect={() => navigate({ to: '/worker/$workerId', params: { workerId: worker.id } } as any)}
                onSelectOffice={(id) => navigate({ to: '/office/$officeId', params: { officeId: id } } as any)}
                language={language}
                t={t}
                dir={dir}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-secondary">
            {t('no_results')}
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryChip: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isActive
      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
      : 'bg-glass border border-border text-secondary hover:bg-glassHigh hover:text-primary'
      }`}
  >
    {label}
  </button>
);

const FullListingCard: React.FC<{
  worker: Worker;
  onSelect: () => void;
  onSelectOffice: (id: string) => void;
  language: string;
  t: (k: string) => string;
  dir: string;
}> = ({ worker, onSelect, onSelectOffice, language, t, dir }) => {
  const office = MOCK_OFFICES.find(o => o.id === worker.officeId);
  const ad = MOCK_ADS.find(a => a.workerId === worker.id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(worker.id);
  const { mutate: toggleLike } = useToggleLike();

  const handleToggleLike = (id: string) => {
    // Assuming worker.id maps to ad.id for this mock context
    const numericId = parseInt(id.replace(/\D/g, '')) || 1;
    toggleLike({ type: 'ad', id: numericId });
    toggleFavorite(id);
  };

  return (
    <GlassCard onClick={onSelect} className="group overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); if (office) onSelectOffice(office.id); }}
        >
          {office && <Avatar src={office.avatar} alt={office.name[language]} size="sm" />}
          <div>
            <h3 className="text-[10px] font-bold text-primary">{office?.name[language]}</h3>
            <div className="flex items-center text-[8px] text-secondary">
              <MapPin size={8} className="me-0.5" />
              {office?.location[language]}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleLike(worker.id); }}
            className={`p-1.5 rounded-full transition-colors ${favorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
          >
            <Heart size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
          <Badge color="neutral">{worker.id}</Badge>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative w-24 h-28 flex-shrink-0 bg-glass rounded-xl overflow-hidden">
          <img
            src={worker.photo}
            alt={worker.name[language]}
            onError={handleImageError}
            className="w-full h-full object-cover border border-border"
            loading="lazy"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between py-0.5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-primary line-clamp-1">{ad?.title[language] || worker.name[language]}</h4>
            <div className="flex flex-wrap gap-1.5">
              <Badge color="accent">{worker.specialty[language]}</Badge>
              <Badge color="neutral">{worker.nationality[language]}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary leading-none">{t('salary')}</span>
              <span className="text-sm font-bold text-brand-700 dark:text-brand-400">{worker.salary} {t('kwd')}</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-accent-subtle flex items-center justify-center text-accent-text group-hover:bg-accent group-hover:text-accent-fg transition-all">
              {dir === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
