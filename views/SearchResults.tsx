import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart, Clock, X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useFavorites } from '../FavoritesContext';
import { useUserRole } from '../UserRoleContext';
import { GlassCard, Badge, SearchInput, Skeleton } from '../components/GlassUI';
import { FilterModal, FilterCriteria } from '../components/FilterModal';
import { useAdFilter, AdFilterParams, AdFilterResult } from '../features/auth/hooks/useAdFilter';
import { useCategories } from '../features/auth/hooks/useCategories';

import { useNavigate, useSearch, useParams } from '@tanstack/react-router';
import { SearchParams } from '../router';
import { useLanguages } from '../features/auth/hooks/useLanguages';

export const SearchResults: React.FC = () => {
  const { category: paramCategory } = useParams({ strict: false }) as { category?: string };
  const searchParams = useSearch({ strict: false }) as SearchParams;
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { mutate: fetchResults, data: apiResponse, isPending } = useAdFilter();

  const [activeCategory, setActiveCategory] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.query || '');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    category: searchParams.category_id,
    nationality: undefined,
    gender: searchParams.gender as FilterCriteria['gender'],
    maxSalary: searchParams.salary,
    maxAge: searchParams.age,
    minExperience: searchParams.years_experience,
    languages: searchParams.languages,
  });

  // Build API params from current state and fire request
  const doSearch = useCallback((overrides?: Partial<AdFilterParams>) => {
    const params: AdFilterParams = {
      worker_name: searchQuery || undefined,
      category_id: activeCategory !== 'All' ? activeCategory : filters.category,
      country_id: filters.country_id ?? searchParams.country_id,
      gender: (filters.gender && filters.gender !== 'Any')
        ? (filters.gender.toLowerCase() as 'male' | 'female' | 'all')
        : undefined,
      salary: filters.maxSalary,
      age: filters.maxAge,
      years_experience: filters.minExperience,
      languages: filters.languages as number[] | undefined,
      latest: searchParams.latest,
      experience: searchParams.experience,
      ...overrides,
    };
    fetchResults(params);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory, filters.category, filters.country_id, filters.gender,
      filters.maxSalary, filters.maxAge, filters.minExperience, filters.languages,
      searchParams.country_id, searchParams.latest, fetchResults]);

  // Single effect: fires on mount AND when activeCategory changes
  const hasMounted = React.useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      // Initial load — fire once
      hasMounted.current = true;
      doSearch();
      return;
    }
    // Subsequent fires — only when activeCategory changes
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
    const params: AdFilterParams = {
      worker_name: searchQuery || undefined,
      category_id: activeCategory !== 'All' ? activeCategory : newFilters.category,
      country_id: newFilters.country_id,
      gender: (newFilters.gender && newFilters.gender !== 'Any')
        ? (newFilters.gender.toLowerCase() as 'male' | 'female' | 'all')
        : undefined,
      salary: newFilters.maxSalary,
      age: newFilters.maxAge,
      years_experience: newFilters.minExperience,
      languages: newFilters.languages as number[] | undefined,
    };
    fetchResults(params);
  };

  const { data: languagesData } = useLanguages();
  const { data: categoriesData } = useCategories();

  // Remove a single filter key and re-fire search
  const removeFilter = (key: keyof FilterCriteria) => {
    const updated = { ...filters, [key]: undefined };
    if (key === 'nationality') updated.country_id = undefined;
    setFilters(updated);
    const params: AdFilterParams = {
      worker_name: searchQuery || undefined,
      category_id: activeCategory !== 'All' ? activeCategory : updated.category,
      country_id: updated.country_id,
      gender: (updated.gender && updated.gender !== 'Any')
        ? (updated.gender.toLowerCase() as 'male' | 'female' | 'all')
        : undefined,
      salary: updated.maxSalary,
      age: updated.maxAge,
      years_experience: updated.minExperience,
      languages: updated.languages as number[] | undefined,
    };
    fetchResults(params);
  };

  const results: AdFilterResult[] = apiResponse?.data || [];
  const total = apiResponse?.pagination.total ?? 0;

  // Build active filter chips
  const activeChips: { label: string; key: keyof FilterCriteria }[] = [];
  if (filters.maxSalary) activeChips.push({ label: `${t('salary')}: ${filters.maxSalary}`, key: 'maxSalary' });
  if (filters.category) {
    const catName = categoriesData?.find(c => c.id === filters.category)?.name;
    if (catName) activeChips.push({ label: catName, key: 'category' });
  }
  if (filters.nationality && filters.nationality !== 'Any') activeChips.push({ label: filters.nationality, key: 'nationality' });
  if (filters.gender && filters.gender !== 'Any') activeChips.push({ label: t(`gender_${filters.gender.toLowerCase()}`), key: 'gender' });
  if (filters.minExperience) activeChips.push({ label: `${t('experience')}: ${filters.minExperience}+`, key: 'minExperience' });
  if (filters.maxAge) activeChips.push({ label: `${t('age')}: ≤${filters.maxAge}`, key: 'maxAge' });
  if (filters.languages && filters.languages.length > 0) {
    filters.languages.forEach((lid) => {
      const langName = languagesData?.find(l => l.id === lid)?.name;
      if (langName) activeChips.push({ label: langName, key: 'languages' });
    });
  }

  const isCountryView = !!searchParams.country_id && !!searchParams.country_name;

  const getTitle = () => {
    switch (searchParams.filterType) {
      case 'available': return t('section_available');
      case 'newest': return t('section_newest');
      case 'experience': return t('section_experience');
      default: return t('search_results') || 'نتائج البحث';
    }
  };

  return (
    <div className="pb-10 min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors flex-shrink-0"
          >
            {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {isCountryView ? (
            /* Country header: flag + name */
            <div className="flex items-center gap-2.5">
              {searchParams.country_image && (
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                  <img
                    src={searchParams.country_image}
                    alt={searchParams.country_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
              <h1 className="text-xl font-bold text-primary">{searchParams.country_name}</h1>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-primary">{getTitle()}</h1>
          )}
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => doSearch()}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {activeChips.map((chip, i) => (
              <div
                key={`${chip.key}-${i}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 flex-shrink-0"
              >
                <span>{chip.label}</span>
                <button
                  onClick={() => {
                    if (chip.key === 'languages') {
                      // Remove all language filters at once
                      const updated = { ...filters, languages: undefined };
                      setFilters(updated);
                      fetchResults({
                        worker_name: searchQuery || undefined,
                        category_id: activeCategory !== 'All' ? activeCategory : updated.category,
                        country_id: updated.country_id ?? searchParams.country_id,
                        gender: (updated.gender && updated.gender !== 'Any') ? updated.gender.toLowerCase() as any : undefined,
                        salary: updated.maxSalary,
                        age: updated.maxAge,
                        years_experience: updated.minExperience,
                      });
                    } else {
                      removeFilter(chip.key);
                    }
                  }}
                  className="hover:text-red-500 transition-colors ml-0.5"
                  aria-label="remove filter"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          initialCriteria={filters}
        />

        {/* Category chips from API */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">

          {isLoadingCategories ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl" />
            ))
          ) : (
            categories?.map(cat => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                isActive={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Results count */}
        {!isPending && (
          <p className="text-sm text-secondary">
            {total} {t('results_found')}
          </p>
        )}

        {isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-36 rounded-[18px]" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map(ad => (
              <AdCard
                key={ad.id}
                ad={ad}
                onSelect={() => navigate({ to: '/worker/$workerId', params: { workerId: ad.id.toString() } } as any)}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-secondary">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium">{t('no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Category Chip ───────────────────────────────────────────────────────────
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

// ─── Ad Card (matches API response shape) ────────────────────────────────────
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png';
  e.currentTarget.className += ' grayscale opacity-30 object-contain p-4';
};

const AdCard: React.FC<{
  ad: AdFilterResult;
  onSelect: () => void;
  t: (k: string) => string;
}> = ({ ad, onSelect, t }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';
  const favorite = isFavorite(ad.id.toString());

  return (
    <GlassCard onClick={onSelect} className="group overflow-hidden">
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-border bg-glass">
          <img
            src={ad.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
            alt={ad.worker_name}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-primary leading-tight line-clamp-1">{ad.worker_name}</h4>
              {isSeeker && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(ad.id.toString()); }}
                  className={`p-1.5 rounded-full flex-shrink-0 transition-colors ${favorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
                >
                  <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge color="accent">{ad.category_name}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-brand-500">
              {ad.salary} {t('kwd')}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-secondary">
              <Clock size={10} />
              <span>{ad.created_at}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
