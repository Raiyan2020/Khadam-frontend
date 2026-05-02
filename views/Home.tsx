import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, ChevronRight, ChevronLeft, Bell, Globe, Heart, MessageCircle, Eye, Users, CheckCircle, Clock } from 'lucide-react';
import { GlassCard, Badge, Avatar, Skeleton, SearchInput } from '../components/GlassUI';
import { FilterModal, FilterCriteria } from '../components/FilterModal';
import { useUserRole } from '../UserRoleContext';
import { ServiceCategory, Ad, Office, Worker } from '../types';
import { MOCK_ADS, MOCK_OFFICES, MOCK_WORKERS, NATIONALITIES } from '../constants';
import { useLanguage } from '../i18n';

import { useNavigate } from '@tanstack/react-router';
import { useCategories } from '../features/auth/hooks/useCategories';
import { useCountries } from '../features/auth/hooks/useCountries';
import { useHomeData, HomeAdFull } from '../features/auth/hooks/useHomeData';
import { useCompanyHomeData } from '../features/auth/hooks/useCompanyHomeData';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';

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

const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // OutExpo easing for a smooth deceleration
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(Math.floor(easeOut * value));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count}</>;
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const [activeCategory, setActiveCategory] = useState<any>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const { t, dir, language } = useLanguage();
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'seeker' || userRole === 'SEEKER';

  const userType = localStorage.getItem('user_type');
  const isCompany = userType === '2';

  const { data: homeData, isLoading: isLoadingHome } = useHomeData(!isCompany);
  const { data: companyHomeData, isLoading: isLoadingCompanyHome } = useCompanyHomeData(isCompany);

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
    if (filterCriteria.nationality !== undefined && filterCriteria.nationality !== 'Any') {
      const nat = worker.nationality;
      if (nat.en !== filterCriteria.nationality && nat.ar !== filterCriteria.nationality) {
        matchesFilters = false;
      }
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
    if (filterCriteria.languages && filterCriteria.languages.length > 0) {
      const workerLangs = worker.languages.map(l => l.en);
      const hasMatch = filterCriteria.languages.some(lang => workerLangs.includes(lang));
      if (!hasMatch) matchesFilters = false;
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
    navigate({ to: '/worker/$workerId', params: { workerId: id } } as any);
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
            onClick={() => navigate({ to: '/notifications' })}
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary relative hover:bg-glassHigh transition-colors flex-shrink-0"
            aria-label={t('nav_notifications')}
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
          </button>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('search_placeholder')}
          onSearch={() => navigate({
            to: '/search',
            search: {
              query: searchQuery || undefined,
              category_id: activeCategory !== 'All' ? activeCategory : undefined,
            }
          } as any)}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />

        {/* FilterModal triggers navigation on apply */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(criteria) => {
            setFilterCriteria(criteria);
            navigate({
              to: '/search',
              search: {
                query: searchQuery || undefined,
                category_id: criteria.category,
                country_id: undefined,
                gender: criteria.gender !== 'Any' ? criteria.gender?.toLowerCase() : undefined,
                salary: criteria.maxSalary,
                age: criteria.maxAge,
                years_experience: criteria.minExperience,
                languages: criteria.languages as number[] | undefined,
              }
            } as any);
          }}
          initialCriteria={filterCriteria}
        />

        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">

          {isLoadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl" />
            ))
          ) : (
            categories?.map(cat => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                isActive={activeCategory === cat.id}
                onClick={() => navigate({
                  to: '/search',
                  search: { category_id: cat.id }
                } as any)}
              />
            ))
          )}
        </div>
      </div>
      {/* Company Dashboard */}
      {isCompany && (
        <div className="px-5 mt-6 mb-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-primary">{t('analytics_dashboard') || 'Overview Analytics'}</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp Redirects */}
            <GlassCard className="p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute -end-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 text-green-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div className="mt-1">
                <h3 className="text-2xl font-bold text-primary tracking-tight">
                  {isLoadingCompanyHome ? <Skeleton className="h-7 w-12" /> : <AnimatedNumber value={companyHomeData?.whatsapp_transfers_count ?? 0} />}
                </h3>
                <p className="text-[10px] text-secondary leading-snug mt-1">{t('stat_whatsapp') || 'WhatsApp Redirects'}</p>
              </div>
            </GlassCard>

            {/* Active / Inactive Ads */}
            <GlassCard className="p-4 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -end-4 -top-4 w-16 h-16 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-brand-500/20" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    className="text-brand-500 drop-shadow-sm"
                    stroke="currentColor" strokeWidth="4"
                    strokeDasharray={`${companyHomeData?.available_ads_percentage ?? 0}, 100`}
                    strokeLinecap="round" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    <AnimatedNumber value={companyHomeData?.available_ads_percentage ?? 0} />%
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="text-base font-bold text-primary"><AnimatedNumber value={companyHomeData?.available_ads_count ?? 0} /></span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-brand-500/40" />
                    <span className="text-base font-bold text-primary"><AnimatedNumber value={companyHomeData?.unavailable_ads_count ?? 0} /></span>
                  </div>
                </div>
                <p className="text-[10px] text-secondary leading-snug">{t('stat_status') || 'Active / Inactive'}</p>
              </div>
            </GlassCard>

            {/* Total Ads */}
            <GlassCard className="p-4 relative overflow-hidden group">
              <div className="absolute -end-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Users size={16} />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <h3 className="text-2xl font-black text-primary tracking-tight">
                  {isLoadingCompanyHome ? <Skeleton className="h-7 w-12" /> : <AnimatedNumber value={companyHomeData?.total_ads_count ?? 0} />}
                </h3>
                <p className="text-[9px] text-secondary font-medium tracking-wide mt-0.5">{t('stat_servants') || 'Total Ads'}</p>
              </div>
            </GlassCard>

            {/* Profile Visits */}
            <GlassCard className="p-4 relative overflow-hidden group">
              <div className="absolute -end-8 -top-8 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all duration-500" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <Eye size={16} />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <h3 className="text-2xl font-black text-primary tracking-tight">
                  {isLoadingCompanyHome ? <Skeleton className="h-7 w-12" /> : <AnimatedNumber value={companyHomeData?.profile_views_count ?? 0} />}
                </h3>
                <p className="text-[9px] text-secondary font-medium tracking-wide mt-0.5">{t('stat_visits') || 'Profile Visits'}</p>
              </div>
            </GlassCard>

            {/* Subscription */}
            <GlassCard className="p-4 flex flex-col justify-center gap-3 col-span-2 relative overflow-hidden">
              <div className="absolute end-0 top-0 bottom-0 w-32 bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-primary">
                      {companyHomeData?.subscription?.name || t('stat_package') || 'Subscription'}
                    </h3>
                    <Badge color={companyHomeData?.subscription ? 'accent' : 'neutral'}>
                      {companyHomeData?.subscription ? (t('active') || 'Active') : (t('no_subscription') || 'No Plan')}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-secondary mt-0.5">
                    {companyHomeData?.subscription
                      ? `${companyHomeData.subscription.remaining_days} ${t('days_remaining') || 'Days Remaining'}`
                      : (t('subscribe_to_unlock') || 'Subscribe to unlock premium features')}
                  </p>
                </div>
              </div>
              {companyHomeData?.subscription && (
                <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden border border-border">
                  <div 
                    className="bg-gradient-to-r from-orange-600 to-orange-400 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.max(0, Math.min(100, (companyHomeData.subscription.remaining_days / companyHomeData.subscription.total_days) * 100))}%` }} 
                  />
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* Seeker-only static analytics (kept as-is) */}
      {!isSeeker && !isCompany && (
        <div className="px-5 mt-6 mb-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-primary">{t('analytics_dashboard') || 'Overview Analytics'}</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp Redirects */}
            <GlassCard className="p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute -end-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 text-green-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div className="mt-1">
                <h3 className="text-2xl font-bold text-primary tracking-tight"><AnimatedNumber value={142} /></h3>
                <p className="text-[10px] text-secondary leading-snug mt-1">{t('stat_whatsapp') || 'WhatsApp Redirects'}</p>
              </div>
            </GlassCard>

            {/* Status (Active/Inactive) */}
            <GlassCard className="p-4 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -end-4 -top-4 w-16 h-16 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />

              {/* SVG Donut Chart */}
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track (Inactive) */}
                  <path
                    className="text-brand-500/20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Foreground Track (Active) */}
                  <path
                    className="text-brand-500 drop-shadow-sm"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${(38 / 45) * 100}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Center Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400"><AnimatedNumber value={Math.round((38 / 45) * 100)} />%</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="text-base font-bold text-primary"><AnimatedNumber value={38} /></span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-brand-500/40" />
                    <span className="text-base font-bold text-primary"><AnimatedNumber value={7} /></span>
                  </div>
                </div>
                <p className="text-[10px] text-secondary leading-snug">{t('stat_status') || 'Active / Inactive'}</p>
              </div>
            </GlassCard>

            {/* Total Servants */}
            <GlassCard className="p-4 relative overflow-hidden group">
              <div className="absolute -end-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />

              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Users size={16} />
                </div>

              </div>

              <div className="relative z-10 mt-1">
                <h3 className="text-2xl font-black text-primary tracking-tight"><AnimatedNumber value={45} /></h3>
                <p className="text-[9px] text-secondary font-medium tracking-wide mt-0.5">{t('stat_servants') || 'Total Workers'}</p>
              </div>

              {/* Minimal Sparkline */}
              <div className="absolute bottom-0 inset-x-0 h-10 opacity-40 mt-4 pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                  <path d="M0 20 Q 25 15, 50 18 T 100 5 L 100 20 Z" fill="url(#blue-grad)" />
                  <path d="M0 20 Q 25 15, 50 18 T 100 5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500" />
                  <defs>
                    <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" className="text-blue-500" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="currentColor" className="text-blue-500" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </GlassCard>

            {/* Profile Visits */}
            <GlassCard className="p-4 relative overflow-hidden group">
              <div className="absolute -end-8 -top-8 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all duration-500" />

              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <Eye size={16} />
                </div>
              </div>

              <div className="relative z-10 mt-1">
                <h3 className="text-2xl font-black text-primary tracking-tight"><AnimatedNumber value={893} /></h3>
                <p className="text-[9px] text-secondary font-medium tracking-wide mt-0.5">{t('stat_visits') || 'Profile Visits'}</p>
              </div>

              {/* Minimal Sparkline */}
              <div className="absolute bottom-0 inset-x-0 h-10 opacity-40 mt-4 pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                  <path d="M0 15 Q 15 5, 30 15 T 70 10 T 100 5 L 100 20 L 0 20 Z" fill="url(#indigo-grad)" />
                  <path d="M0 15 Q 15 5, 30 15 T 70 10 T 100 5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500" />
                  <defs>
                    <linearGradient id="indigo-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" className="text-indigo-500" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="currentColor" className="text-indigo-500" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </GlassCard>

            {/* Package Expiry */}
            <GlassCard className="p-4 flex flex-col justify-center gap-3 col-span-2 relative overflow-hidden">
              <div className="absolute end-0 top-0 bottom-0 w-32 bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-primary">{t('stat_package') || 'Premium Package'}</h3>
                    <Badge color="accent">14 {t('days') || 'Days'}</Badge>
                  </div>
                  <p className="text-[10px] text-secondary mt-0.5">{t('stat_expires') || 'Remaining until your package expires'}</p>
                </div>
              </div>
              <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden border border-border">
                <div className="bg-gradient-to-r from-orange-600 to-orange-400 h-1.5 rounded-full" style={{ width: '30%' }} />
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      <div className="space-y-8 mt-6">
        {/* Nationality Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-5">
            <h2 className="text-sm font-bold text-primary">{t('section_nationality')}</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-5 pb-2">
            {isLoadingCountries ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
              ))
            ) : (
              countries?.map(nat => (
                <div
                  key={nat.id}
                  onClick={() => navigate({
                    to: '/search',
                    search: {
                      country_id: nat.id,
                      country_name: nat.name,
                      country_image: nat.image,
                    }
                  } as any)}
                  className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden transition-all duration-300 border-2 border-border hover:border-brand-300">
                    <img
                      src={nat.image}
                      alt={nat.name}
                      onError={handleFlagError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold transition-colors text-secondary">{nat.name}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Continue watching / history */}
        {(() => {
          const historyData = isCompany ? companyHomeData?.history : homeData?.history;
          return historyData && historyData.length > 0 && (
            <SectionContainer title={t('section_continue')} onViewAll={() => navigate({ to: '/search', search: { filterType: 'continue', history: 1 } })}>
              <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
                {historyData.map((worker: any) => (
                  <CompactCard
                    key={worker.id}
                    name={worker.worker_name}
                    image={worker.image}
                    subtitle={worker.country_name}
                    onClick={() => handleWorkerClick(worker.id.toString())}
                  />
                ))}
              </div>
            </SectionContainer>
          );
        })()}

        {/* Available ads */}
        {(() => {
          const isLoading = isCompany ? isLoadingCompanyHome : isLoadingHome;
          const availableAds = isCompany ? companyHomeData?.available_ads : homeData?.available_ads;
          return isLoading ? (
            <SectionContainer title={t('section_available')} canShowAll={false}>
              <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-32 aspect-[4/5] rounded-2xl shrink-0" />
                ))}
              </div>
            </SectionContainer>
          ) : (
            availableAds && availableAds.length > 0 && (
              <SectionContainer title={t('section_available')} canShowAll={false}>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
                  {availableAds.map((worker: any) => (
                    <CompactCard
                      key={worker.id}
                      name={worker.worker_name}
                      image={worker.image}
                      subtitle={worker.category_name}
                      onClick={() => handleWorkerClick(worker.id.toString())}
                    />
                  ))}
                </div>
              </SectionContainer>
            )
          );
        })()}

        {/* Latest ads */}
        <SectionContainer title={t('section_newest')} onViewAll={() => navigate({ to: '/search', search: { filterType: 'newest', latest: 1 } } as any)}>
          <div className="px-5 space-y-4">
            {(isCompany ? isLoadingCompanyHome : isLoadingHome) ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-40 rounded-[18px]" />
              ))
            ) : (
              (isCompany ? companyHomeData?.latest_ads : homeData?.latest_ads)?.slice(0, 4).map(ad => (
                <FullListingCard
                  key={ad.id}
                  ad={ad}
                  onSelect={() => handleWorkerClick(ad.id.toString())}
                  onSelectOffice={(id) => navigate({ to: '/office/$officeId', params: { officeId: id } } as any)}
                  t={t}
                  dir={dir}
                />
              ))
            )}
          </div>
        </SectionContainer>

        {/* Most experienced ads */}
        <SectionContainer title={t('section_experience')} onViewAll={() => navigate({ to: '/search', search: { filterType: 'experience', experience: 1 } } as any)}>
          <div className="px-5 space-y-4">
            {(isCompany ? isLoadingCompanyHome : isLoadingHome) ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-40 rounded-[18px]" />
              ))
            ) : (
              (isCompany ? companyHomeData?.most_experience_ads : homeData?.most_experience_ads)?.slice(0, 4).map(ad => (
                <FullListingCard
                  key={ad.id}
                  ad={ad}
                  onSelect={() => handleWorkerClick(ad.id.toString())}
                  onSelectOffice={(id) => navigate({ to: '/office/$officeId', params: { officeId: id } } as any)}
                  t={t}
                  dir={dir}
                />
              ))
            )}
          </div>
        </SectionContainer>
      </div>

    </div>
  );
};

const SectionContainer: React.FC<{
  title: string;
  children: React.ReactNode;
  onViewAll?: () => void;
  canShowAll?: boolean;
}> = ({ title, children, onViewAll, canShowAll = true }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        {canShowAll && onViewAll && (
          <button onClick={onViewAll} className="text-xs font-semibold text-accent-text hover:underline">{t('view_all')}</button>
        )}
      </div>
      {children}
    </div>
  );
};

const CompactCard: React.FC<{
  name: string;
  image: string | null;
  subtitle: string;
  onClick: () => void;
}> = ({ name, image, subtitle, onClick }) => (
  <div onClick={onClick} className="flex-shrink-0 w-32 cursor-pointer group">
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-sm mb-2 bg-glass">
      <img
        src={image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
        alt={name}
        onError={handleImageError}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-[10px] font-bold text-white truncate">{name}</p>
        <p className="text-[8px] text-white/70">{subtitle}</p>
      </div>
    </div>
  </div>
);

const FullListingCard: React.FC<{
  ad: HomeAdFull;
  onSelect: () => void;
  onSelectOffice: (id: string) => void;
  t: (k: any) => string;
  dir: string;
}> = ({ ad, onSelect, onSelectOffice, t, dir }) => {
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';
  const { mutate: toggleLike } = useToggleLike();

  const handleToggleLike = (id: number) => {
    toggleLike({ type: 'ad', id });
  };

  return (
    <GlassCard onClick={onSelect} className="group overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onSelectOffice(ad.office.id.toString()); }}
        >
          <Avatar src={ad.office.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'} alt={ad.office.name} size="sm" />
          <div>
            <h3 className="text-[10px] font-bold text-primary">{ad.office.name}</h3>
            <div className="flex items-center text-[8px] text-secondary">
              <MapPin size={8} className="me-0.5" />
              {ad.office.state}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSeeker && (
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleLike(ad.id); }}
              className={`p-1.5 rounded-full transition-colors ${ad.is_liked ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
            >
              <Heart size={16} fill={ad.is_liked ? "currentColor" : "none"} />
            </button>
          )}
          <Badge color="neutral">{ad.code}</Badge>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative w-24 h-28 flex-shrink-0 bg-glass rounded-xl overflow-hidden">
          <img
            src={ad.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
            alt={ad.worker_name}
            onError={handleImageError}
            className="w-full h-full object-cover border border-border"
            loading="lazy"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between py-0.5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-primary line-clamp-1">{ad.worker_name}</h4>
            <div className="flex flex-wrap gap-1.5">
              <Badge color="accent">{ad.category_name}</Badge>
              <Badge color="neutral">{ad.country_name}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary leading-none">{t('salary')}</span>
              <span className="text-sm font-bold text-brand-700 dark:text-brand-400">{ad.salary} {t('kwd')}</span>
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
    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isActive
      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
      : 'bg-glass text-secondary border border-border hover:bg-glassHigh'
      }`}
  >
    {label}
  </button>
);
