import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart, MapPin, Search, Filter, X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useUserRole } from '../UserRoleContext';
import { GlassCard, Badge, SearchInput, Skeleton } from '../components/GlassUI';
import { FilterModal, FilterCriteria } from '../components/FilterModal';
import { useAdFilter, AdFilterParams, AdFilterResult } from '../features/auth/hooks/useAdFilter';
import { useCategories } from '../features/auth/hooks/useCategories';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { SearchParams } from '../router';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';

export const CountryResults: React.FC = () => {
  const { category: paramCategory } = useParams({ strict: false }) as { category?: string };
  const searchParams = useSearch({ strict: false }) as SearchParams;
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { mutate: fetchResults, data: apiResponse, isPending } = useAdFilter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<number | 'All'>('All');

  const [filters, setFilters] = useState<FilterCriteria>({
    category: undefined,
    nationality: undefined,
    gender: 'Any',
    maxSalary: undefined,
    maxAge: undefined,
    minExperience: undefined,
    languages: undefined,
  });

  const doSearch = useCallback((overrides?: Partial<AdFilterParams>) => {
    const params: AdFilterParams = {
      worker_name: searchQuery || undefined,
      category_id: activeCategory === 'All' ? undefined : activeCategory,
      country_id: searchParams.country_id,
      gender: (filters.gender && filters.gender !== 'Any')
        ? (filters.gender.toLowerCase() as 'male' | 'female' | 'all')
        : undefined,
      salary: filters.maxSalary,
      age: filters.maxAge,
      years_experience: filters.minExperience,
      languages: filters.languages as number[] | undefined,
      page: overrides?.page ?? currentPage,
      ...overrides,
    };
    fetchResults(params);
  }, [searchQuery, activeCategory, searchParams.country_id, filters, currentPage, fetchResults]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const results: AdFilterResult[] = apiResponse?.data || [];
  const pagination = apiResponse?.pagination;

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
            {searchParams.country_image && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                <img src={searchParams.country_image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-xl font-bold text-primary">{searchParams.country_name || t('search_results')}</h1>
          </div>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => { setCurrentPage(1); doSearch({ page: 1 }); }}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />

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
                onClick={() => { setActiveCategory('All'); setCurrentPage(1); }}
              />
              {categories?.map(cat => (
                <CategoryChip
                  key={cat.id}
                  label={cat.name}
                  isActive={activeCategory === cat.id}
                  onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-40 rounded-[18px]" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="space-y-4">
              {results.map(ad => (
                <ListingCard
                  key={ad.id}
                  ad={ad}
                  onSelect={() => navigate({ to: '/worker/$workerId', params: { workerId: ad.id.toString() } } as any)}
                  t={t}
                />
              ))}
            </div>

            {/* Pagination */}
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
          <div className="text-center py-20 text-secondary">
            <p>{t('no_results')}</p>
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        initialCriteria={filters}
      />
    </div>
  );
};

const CategoryChip: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isActive
      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
      : 'bg-glass border border-border text-secondary hover:bg-glassHigh'
      }`}
  >
    {label}
  </button>
);

const ListingCard: React.FC<{
  ad: AdFilterResult;
  onSelect: () => void;
  t: (k: string) => string;
}> = ({ ad, onSelect, t }) => {
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';
  const { mutate: toggleLike } = useToggleLike();

  const handleToggleLike = (id: number) => {
    toggleLike({ type: 'ad', id });
  };

  return (
    <GlassCard onClick={onSelect} className="group overflow-hidden">
      <div className="flex gap-4">
        <div className="w-28 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-border bg-glass">
          <img
            src={ad.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
            alt={ad.worker_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'; }}
          />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-primary text-base line-clamp-1">{ad.worker_name}</h4>
              {isSeeker && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleLike(ad.id); }}
                  className={`p-2 rounded-full transition-colors ${ad.is_liked ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
                >
                  <Heart size={18} fill={ad.is_liked ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge color="accent">{ad.category_name}</Badge>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary leading-none uppercase tracking-wider">{t('salary')}</span>
              <span className="text-lg font-black text-brand-500">{ad.salary} <span className="text-xs font-bold uppercase">{t('kwd')}</span></span>
            </div>
            <div className="text-[10px] text-secondary font-medium bg-glass px-2 py-1 rounded-lg border border-border">
              {ad.created_at}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
