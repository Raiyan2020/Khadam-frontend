import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Filter, Search, Heart } from 'lucide-react';
import { Worker, ServiceCategory } from '../types';
import { MOCK_WORKERS, MOCK_OFFICES, MOCK_ADS, NATIONALITIES } from '../constants';
import { useLanguage } from '../i18n';
import { useFavorites } from '../FavoritesContext';
import { GlassCard, Avatar, Badge } from '../components/GlassUI';

interface SearchResultsProps {
  filterType?: string;
  category?: string;
  query?: string;
  onBack: () => void;
  onSelectWorker: (id: string) => void;
  onSelectOffice: (id: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ filterType, category, query, onBack, onSelectWorker, onSelectOffice }) => {
  const { t, dir, language } = useLanguage();
  
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>(
    (category as ServiceCategory) || 'All'
  );
  const [searchQuery, setSearchQuery] = useState(query || '');

  const results = useMemo(() => {
    let filtered = [...MOCK_WORKERS];

    // Apply base filters
    if (activeCategory !== 'All') {
      filtered = filtered.filter(w => w.category === activeCategory);
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.name[language].toLowerCase().includes(searchLower) || 
        w.nationality[language].toLowerCase().includes(searchLower) ||
        w.specialty[language].toLowerCase().includes(searchLower)
      );
    }

    // Apply specific filterType sorting/filtering
    switch (filterType) {
      case 'available':
        filtered = filtered.filter(w => w.availability === 'Available');
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'budget':
        filtered.sort((a, b) => a.salary - b.salary);
        break;
      case 'experience':
        filtered.sort((a, b) => b.experienceYears - a.experienceYears);
        break;
      case 'continue':
        const saved = localStorage.getItem('last_viewed_workers');
        const lastViewedIds: string[] = saved ? JSON.parse(saved) : [];
        filtered = filtered.filter(w => lastViewedIds.includes(w.id));
        filtered.sort((a, b) => lastViewedIds.indexOf(a.id) - lastViewedIds.indexOf(b.id));
        break;
      default:
        // Default sorting (newest)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [activeCategory, searchQuery, filterType, language]);

  const getTitle = () => {
    switch (filterType) {
      case 'available': return t('section_available');
      case 'newest': return t('section_newest');
      case 'budget': return t('section_budget');
      case 'experience': return t('section_experience');
      case 'continue': return t('section_continue');
      default: return t('search_results') || 'Search Results';
    }
  };

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
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
          >
            {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <h1 className="text-xl font-bold text-primary">{getTitle()}</h1>
        </div>

        <div className="relative group">
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full h-11 bg-glass border border-border rounded-[14px] ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:bg-glassHigh focus:ring-4 focus:ring-[var(--focus-ring)] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute start-3.5 top-3 text-secondary/70 group-focus-within:text-brand-500 transition-colors" size={18} />
          <button className="absolute end-3 top-2.5 text-accent-text bg-accent-subtle p-1 rounded-md hover:bg-brand-300 transition-colors">
            <Filter size={14} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          <CategoryChip 
            label={getTranslatedCategory('All')} 
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
                onSelect={() => onSelectWorker(worker.id)}
                onSelectOffice={onSelectOffice}
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
    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
      isActive 
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
              <span>{office?.location[language]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(worker.id); }}
            className={`p-1.5 rounded-full transition-colors ${favorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
          >
            <Heart size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
          <div className="text-[10px] text-secondary bg-background/50 px-2 py-1 rounded-md border border-border">
            {t('ref_id')}: {worker.id.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-border relative">
          <img 
            src={worker.photo} 
            alt={worker.name[language]} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          {ad?.featured && (
            <div className="absolute top-1 start-1 bg-accent-subtle text-accent-text text-[8px] font-bold px-1.5 py-0.5 rounded">
              Featured
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-primary leading-tight">{worker.name[language]}</h4>
              <span className="font-bold text-brand-500 text-sm whitespace-nowrap ms-2">
                {worker.salary} {t('kwd')}
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5">{worker.specialty[language]}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[9px] text-secondary/70 uppercase tracking-wider">{t('nationality')}</span>
              <span className="text-[11px] font-semibold text-primary">{worker.nationality[language]}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-secondary/70 uppercase tracking-wider">{t('experience')}</span>
              <span className="text-[11px] font-semibold text-primary">{worker.experienceYears} {t('exp_years')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-secondary/70 uppercase tracking-wider">{t('age')}</span>
              <span className="text-[11px] font-semibold text-primary">{worker.age} {t('years_old')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-secondary/70 uppercase tracking-wider">{t('gender')}</span>
              <span className="text-[11px] font-semibold text-primary">{worker.gender === 'Female' ? t('gender_female') : t('gender_male')}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
