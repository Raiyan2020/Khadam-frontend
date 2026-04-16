
import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, ChevronRight, Filter, ChevronLeft, Bell, Globe, Heart } from 'lucide-react';
import { GlassCard, Badge, Avatar } from '../components/GlassUI';
import { FilterModal, FilterCriteria } from '../components/FilterModal';
import { useFavorites } from '../FavoritesContext';
import { ServiceCategory, Ad, Office, Worker } from '../types';
import { MOCK_ADS, MOCK_OFFICES, MOCK_WORKERS, NATIONALITIES } from '../constants';
import { useLanguage } from '../i18n';

interface HomeProps {
  onSelectWorker: (id: string) => void;
  onSelectOffice: (id: string) => void;
  onNavigateNotifications: () => void;
  onSelectNationality: (nationality: string) => void;
  onViewAll: (filterType: string) => void;
  onSearch: (query: string, category: string) => void;
}

// Global Image Fallback Handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'; // Fallback to logo or generic avatar
  e.currentTarget.className += ' grayscale opacity-30 object-contain p-4';
};

const handleFlagError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.style.display = 'none';
  if (e.currentTarget.parentElement) {
    e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-accent-subtle text-accent-text font-bold text-xs"><Globe size={24}/></div>';
  }
};

export const Home: React.FC<HomeProps> = ({ onSelectWorker, onSelectOffice, onNavigateNotifications, onSelectNationality, onViewAll, onSearch }) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const { t, dir, language } = useLanguage();

  const [lastViewedIds, setLastViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('last_viewed_workers');
    return saved ? JSON.parse(saved) : ['w1', 'w4', 'w8']; 
  });

  const baseFilter = (worker: Worker) => {
    const matchesCategory = activeCategory === 'All' || worker.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      worker.name[language].toLowerCase().includes(searchLower) || 
      worker.nationality[language].toLowerCase().includes(searchLower) ||
      worker.specialty[language].toLowerCase().includes(searchLower);
      
    // Apply advanced filters
    let matchesFilters = true;
    if (filterCriteria.maxSalary !== undefined && worker.salary > filterCriteria.maxSalary) {
      matchesFilters = false;
    }
    if (filterCriteria.language !== undefined && filterCriteria.language !== 'Any') {
      const hasLang = worker.languages.some(l => l.en === filterCriteria.language || l.ar === filterCriteria.language);
      if (!hasLang) matchesFilters = false;
    }
    if (filterCriteria.gender !== undefined && filterCriteria.gender !== 'Any' && worker.gender !== filterCriteria.gender) {
      matchesFilters = false;
    }
    if (filterCriteria.minExperience !== undefined && worker.experienceYears < filterCriteria.minExperience) {
      matchesFilters = false;
    }
    if (filterCriteria.maxAge !== undefined && worker.age > filterCriteria.maxAge) {
      matchesFilters = false;
    }
    
    return matchesCategory && matchesSearch && matchesFilters;
  };

  const continueViewed = useMemo(() => {
    return MOCK_WORKERS
      .filter(w => lastViewedIds.includes(w.id))
      .filter(baseFilter)
      .sort((a, b) => lastViewedIds.indexOf(a.id) - lastViewedIds.indexOf(b.id))
      .slice(0, 10);
  }, [lastViewedIds, activeCategory, searchQuery, language]);

  const availableNow = useMemo(() => {
    return MOCK_WORKERS
      .filter(w => w.availability === 'Available')
      .filter(baseFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeCategory, searchQuery, language]);

  const newestListings = useMemo(() => {
    return MOCK_WORKERS
      .filter(baseFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeCategory, searchQuery, language]);

  const budgetListings = useMemo(() => {
    return MOCK_WORKERS
      .filter(baseFilter)
      .sort((a, b) => a.salary - b.salary);
  }, [activeCategory, searchQuery, language]);

  const experiencedListings = useMemo(() => {
    return MOCK_WORKERS
      .filter(baseFilter)
      .sort((a, b) => b.experienceYears - a.experienceYears);
  }, [activeCategory, searchQuery, language]);

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

  const handleWorkerClick = (id: string) => {
    const newHistory = [id, ...lastViewedIds.filter(v => v !== id)].slice(0, 10);
    setLastViewedIds(newHistory);
    localStorage.setItem('last_viewed_workers', JSON.stringify(newHistory));
    onSelectWorker(id);
  };

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src="https://raiyansoft.com/wp-content/uploads/2026/02/icon-s-d.png" 
                alt="Logo" 
                className="h-[40px] w-auto max-w-[135px] object-contain"
              />
            </div>
            <div className="hidden min-[360px]:block">
              <h1 className="text-lg font-bold text-primary leading-tight">{t('app_name')}</h1>
              <p className="text-[10px] text-secondary">{t('subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onNavigateNotifications}
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary relative hover:bg-glassHigh transition-colors flex-shrink-0"
            aria-label={t('nav_notifications')}
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
          </button>
        </div>

        <div className="relative group">
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full h-11 bg-glass border border-border rounded-[14px] ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:bg-glassHigh focus:ring-4 focus:ring-[var(--focus-ring)] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(searchQuery, activeCategory);
              }
            }}
          />
          <Search className="absolute start-3.5 top-3 text-secondary/70 group-focus-within:text-brand-500 transition-colors" size={18} />
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="absolute end-3 top-2.5 text-accent-text bg-accent-subtle p-1 rounded-md hover:bg-brand-300 transition-colors"
          >
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

      <div className="space-y-8 mt-6">
        {/* Nationality Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-5">
             <h2 className="text-sm font-bold text-primary">{t('section_nationality')}</h2>
           </div>
           <div className="flex gap-6 overflow-x-auto no-scrollbar px-5 pb-2">
              {NATIONALITIES.map(nat => (
                <div 
                  key={nat.name.en}
                  onClick={() => onSelectNationality(nat.name.en)}
                  className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden transition-all duration-300 border-2 border-border hover:border-brand-300">
                    <img 
                      src={nat.flag} 
                      alt={nat.name[language]} 
                      onError={handleFlagError}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-[10px] font-bold transition-colors text-secondary">{nat.name[language]}</span>
                </div>
              ))}
           </div>
        </section>

        {continueViewed.length > 0 && (
          <SectionContainer title={t('section_continue')} onViewAll={() => onViewAll('continue')}>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
              {continueViewed.map(worker => (
                <CompactCard 
                  key={worker.id} 
                  worker={worker} 
                  onClick={() => handleWorkerClick(worker.id)} 
                  language={language}
                />
              ))}
            </div>
          </SectionContainer>
        )}

        {availableNow.length > 0 && (
          <SectionContainer title={t('section_available')} onViewAll={() => onViewAll('available')}>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
              {availableNow.map(worker => (
                <CompactCard 
                  key={worker.id} 
                  worker={worker} 
                  onClick={() => handleWorkerClick(worker.id)} 
                  language={language}
                />
              ))}
            </div>
          </SectionContainer>
        )}

        <SectionContainer title={t('section_newest')} onViewAll={() => onViewAll('newest')}>
          <div className="px-5 space-y-4">
            {newestListings.slice(0, 4).map(worker => (
              <FullListingCard 
                key={worker.id} 
                worker={worker} 
                onSelect={() => handleWorkerClick(worker.id)}
                onSelectOffice={onSelectOffice}
                language={language}
                t={t}
                dir={dir}
              />
            ))}
          </div>
        </SectionContainer>

        <SectionContainer title={t('section_budget')} onViewAll={() => onViewAll('budget')}>
          <div className="px-5 space-y-4">
            {budgetListings.slice(0, 4).map(worker => (
              <FullListingCard 
                key={worker.id} 
                worker={worker} 
                onSelect={() => handleWorkerClick(worker.id)}
                onSelectOffice={onSelectOffice}
                language={language}
                t={t}
                dir={dir}
              />
            ))}
          </div>
        </SectionContainer>

        <SectionContainer title={t('section_experience')} onViewAll={() => onViewAll('experience')}>
          <div className="px-5 space-y-4">
            {experiencedListings.slice(0, 4).map(worker => (
              <FullListingCard 
                key={worker.id} 
                worker={worker} 
                onSelect={() => handleWorkerClick(worker.id)}
                onSelectOffice={onSelectOffice}
                language={language}
                t={t}
                dir={dir}
              />
            ))}
          </div>
        </SectionContainer>
      </div>

      {/* Filter Modal */}
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        onApply={setFilterCriteria}
        initialCriteria={filterCriteria}
      />
    </div>
  );
};

const SectionContainer: React.FC<{ title: string; children: React.ReactNode; onViewAll?: () => void }> = ({ title, children, onViewAll }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs font-semibold text-accent-text hover:underline">{t('view_all')}</button>
        )}
      </div>
      {children}
    </div>
  );
};

const CompactCard: React.FC<{ worker: Worker; onClick: () => void; language: string }> = ({ worker, onClick, language }) => (
  <div onClick={onClick} className="flex-shrink-0 w-32 cursor-pointer group">
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-sm mb-2 bg-glass">
      <img 
        src={worker.photo} 
        alt={worker.name[language]} 
        onError={handleImageError}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        loading="lazy" 
      />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-[10px] font-bold text-white truncate">{worker.name[language]}</p>
        <p className="text-[8px] text-white/70">{worker.specialty[language]}</p>
      </div>
    </div>
  </div>
);

const FullListingCard: React.FC<{ 
  worker: Worker; 
  onSelect: () => void; 
  onSelectOffice: (id: string) => void; 
  language: string; 
  t: (k: any) => string;
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
              {office?.location[language]}
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

const CategoryChip: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
      isActive 
        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
        : 'bg-glass text-secondary border border-border hover:bg-glassHigh'
    }`}
  >
    {label}
  </button>
);
