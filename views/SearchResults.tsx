import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart, Clock, X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useUserRole } from '../UserRoleContext';
import { GlassCard, Badge, SearchInput, Skeleton } from '../components/GlassUI';
import { FilterModal, FilterCriteria } from '../components/FilterModal';
import { useAdFilter, AdFilterParams, AdFilterResult } from '../features/auth/hooks/useAdFilter';
import { useCategories } from '../features/auth/hooks/useCategories';

import { useNavigate, useSearch, useParams } from '@tanstack/react-router';
import { SearchParams } from '../router';
import { useLanguages } from '../features/auth/hooks/useLanguages';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';

export const SearchResults: React.FC = () => {
  const { category: paramCategory } = useParams({ strict: false }) as { category?: string };
  const searchParams = useSearch({ strict: false }) as SearchParams;
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { mutate: fetchResults, data: apiResponse, isPending } = useAdFilter();

  const [searchQuery, setSearchQuery] = useState(searchParams.query || '');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(searchParams.page || 1);

  const [filters, setFilters] = useState<FilterCriteria>({
    category: searchParams.category_id,
    nationality: undefined,
    gender: searchParams.gender as FilterCriteria['gender'],
    maxSalary: searchParams.salary,
    maxAge: searchParams.age,
    minExperience: searchParams.years_experience,
    languages: searchParams.languages,
  });

  const activeCategory = filters.category || 'All';
  const setActiveCategory = (catId: number | 'All') => {
    setFilters(prev => ({ ...prev, category: catId === 'All' ? undefined : catId }));
    setCurrentPage(1); // Reset to page 1 on category change
  };

  // Build API params from current state and fire request
  const doSearch = useCallback((overrides?: Partial<AdFilterParams>) => {
    const params: AdFilterParams = {
      worker_name: searchQuery || undefined,
      category_id: filters.category,
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
      history: searchParams.history,
      page: overrides?.page ?? currentPage,
      ...overrides,
    };
    fetchResults(params);

    // Update URL
    navigate({
      to: '/search',
      search: (prev: any) => ({
        ...prev,
        ...params,
        query: params.worker_name,
        category_id: params.category_id,
        page: params.page,
      }),
      replace: true,
    } as any);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters.category, filters.country_id, filters.gender,
    filters.maxSalary, filters.maxAge, filters.minExperience, filters.languages,
    searchParams.country_id, searchParams.latest, searchParams.experience, searchParams.history, currentPage, fetchResults]);

  // Initial load
  useEffect(() => {
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync on category change
  useEffect(() => {
    if (hasMounted.current) {
      doSearch({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  const hasMounted = React.useRef(false);
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
    setCurrentPage(1);
    doSearch({
      ...newFilters,
      worker_name: searchQuery || undefined,
      page: 1,
    } as any);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    doSearch({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { data: languagesData } = useLanguages();
  const { data: categoriesData } = useCategories();

  // Remove a single filter key and re-fire search
  const removeFilter = (key: keyof FilterCriteria) => {
    const updated = { ...filters, [key]: undefined };
    if (key === 'nationality') updated.country_id = undefined;
    setFilters(updated);
    setCurrentPage(1);
    doSearch({ ...updated, page: 1 } as any);
  };

  const results: AdFilterResult[] = apiResponse?.data || [];
  const pagination = apiResponse?.pagination;
  const total = pagination?.total ?? 0;

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
      case 'continue': return t('section_continue');
      default: return t('search_results') || 'نتائج البحث';
    }
  };

  return (
    <div className="pb-10 min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-4 space-y-4">
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
          onSearch={() => { setCurrentPage(1); doSearch({ page: 1 }); }}
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
                      setCurrentPage(1);
                      doSearch({
                        ...updated,
                        page: 1,
                        worker_name: searchQuery || undefined,
                        history: searchParams.history,
                        latest: searchParams.latest,
                        experience: searchParams.experience,
                      } as any);
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
            <>
              <CategoryChip
                label={t('cat_all')}
                isActive={activeCategory === 'All'}
                onClick={() => setActiveCategory('All')}
              />
              {categories?.map(cat => (
                <CategoryChip
                  key={cat.id}
                  label={cat.name}
                  isActive={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
              ))}
            </>
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
          <>
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

            {/* Pagination UI */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 py-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-10 h-10 rounded-xl bg-glass border border-border flex items-center justify-center text-primary disabled:opacity-30 transition-all hover:bg-glassHigh"
                >
                  {dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, i) => {
                    // Simple pagination logic to show current +/- 2 pages
                    let pageNum = currentPage;
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    if (pageNum <= 0 || pageNum > pagination.last_page) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'bg-glass border border-border text-secondary hover:bg-glassHigh'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === pagination.last_page}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-10 h-10 rounded-xl bg-glass border border-border flex items-center justify-center text-primary disabled:opacity-30 transition-all hover:bg-glassHigh"
                >
                  {dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            )}
          </>
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
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';
  const { mutate: toggleLike, isPending, variables } = useToggleLike();

  const handleToggleLike = (id: number) => {
    toggleLike({ type: 'ad', id });
  };

  const isThisPending = isPending && variables?.id === ad.id;
  const favoriteStatus = isThisPending ? !ad.is_liked : ad.is_liked;

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
                  onClick={(e) => { e.stopPropagation(); handleToggleLike(ad.id); }}
                  disabled={isThisPending}
                  className={`p-1.5 rounded-full flex-shrink-0 transition-all ${isThisPending ? 'opacity-50 scale-90' : 'hover:scale-110'} ${favoriteStatus ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
                >
                  <Heart size={15} fill={favoriteStatus ? 'currentColor' : 'none'} />
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
