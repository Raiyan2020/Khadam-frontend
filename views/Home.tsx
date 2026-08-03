import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, ChevronRight, ChevronLeft, Bell, Globe, Heart, MessageCircle, Eye, Users, CheckCircle, Clock, Sun, Moon, Smartphone } from 'lucide-react';
import { GlassCard, Badge, Avatar, Skeleton, SearchInput } from '../components/GlassUI';
import { FilterModal, FilterCriteria } from '../components/FilterModal';
import { useUserRole } from '../UserRoleContext';
import { ServiceCategory, Ad, Office, Worker, UserRole } from '../types';
import { MOCK_ADS, MOCK_OFFICES, MOCK_WORKERS, NATIONALITIES } from '../constants';
import { useLanguage } from '../i18n';
import { useTheme } from '../theme';

import { useNavigate } from '@tanstack/react-router';
import { useCategories } from '../features/auth/hooks/useCategories';
import { useCountries } from '../features/auth/hooks/useCountries';
import { useHomeData, HomeAdFull } from '../features/auth/hooks/useHomeData';
import { useCompanyHomeData } from '../features/auth/hooks/useCompanyHomeData';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';
import { useUnreadCount } from '../features/auth/hooks/useNotifications';
import { saveScrollPosition, getScrollContainer, restoreScrollPosition } from '../lib/scrollStore';
import { useDragScroll } from '../lib/useDragScroll';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../config';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem('khadam_show_search');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  // Persist showSearch whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('khadam_show_search', String(showSearch));
    } catch { /* ignore */ }
  }, [showSearch]);

  // Show/hide search bar based on scroll position
  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      if (scrollTop > 400) {
        setShowSearch(false);
      } else if (scrollTop < 50) {
        setShowSearch(true);
      }
      // Save scroll position on every scroll so any navigation restores it
      saveScrollPosition('home', scrollTop);
    };
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position when returning from any route
  useEffect(() => {
    const pos = (() => {
      try {
        const store = JSON.parse(sessionStorage.getItem('khadam_scroll') || '{}');
        return store['home'] ?? 0;
      } catch {
        return 0;
      }
    })();
    if (!pos) return;
    // Retry until the container is mounted and can actually scroll
    let attempts = 0;
    const tryRestore = () => {
      const container = document.querySelector('main');
      if (container && container.scrollHeight > container.clientHeight) {
        container.scrollTop = pos;
      } else if (attempts < 20) {
        attempts++;
        requestAnimationFrame(tryRestore);
      }
    };
    requestAnimationFrame(tryRestore);
  }, []);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const { t, dir, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { userRole } = useUserRole();
  // Read the role from context, not localStorage — an inline read isn't
  // reactive, so the seeker home stayed up after logging in as an office.
  const isCompany = userRole === UserRole.OFFICE;
  const isSeeker = !isCompany;

  const { data: homeData, isLoading: isLoadingHome } = useHomeData(!isCompany);
  const { data: companyHomeData, isLoading: isLoadingCompanyHome } = useCompanyHomeData(isCompany);
  const { data: unreadCount } = useUnreadCount();
  const hasUnreadNotifications = (unreadCount ?? 0) > 0;

  const [lastViewedIds, setLastViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('last_viewed_workers');
    return saved ? JSON.parse(saved) : ['w1', 'w4', 'w8'];
  });

  const baseFilter = (worker: Worker) => {

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

    return matchesSearch && matchesFilters;
  };

  const continueViewed = useMemo(() => {
    return MOCK_WORKERS
      .filter(w => lastViewedIds.includes(w.id))
      .filter(baseFilter)
      .sort((a, b) => lastViewedIds.indexOf(a.id) - lastViewedIds.indexOf(b.id))
      .slice(0, 10);
  }, [lastViewedIds, searchQuery, language]);

  const availableNow = useMemo(() => {
    return MOCK_WORKERS
      .filter(w => w.availability === 'Available')
      .filter(baseFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchQuery, language]);

  const newestListings = useMemo(() => {
    return MOCK_WORKERS
      .filter(baseFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchQuery, language]);

  const budgetListings = useMemo(() => {
    return MOCK_WORKERS
      .filter(baseFilter)
      .sort((a, b) => a.salary - b.salary);
  }, [searchQuery, language]);

  const experiencedListings = useMemo(() => {
    return MOCK_WORKERS
      .filter(baseFilter)
      .sort((a, b) => b.experienceYears - a.experienceYears);
  }, [searchQuery, language]);

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
    saveScrollPosition('home', getScrollContainer()?.scrollTop ?? 0);
    navigate({ to: '/worker/$workerId', params: { workerId: id } } as any);
  };

  return (
    <div className="pb-10">
      <div className={`sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-6 transition-all duration-500 ease-in-out ${showSearch ? 'pb-4' : 'pb-2'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between px-4">
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
            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="w-8 h-8 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors flex-shrink-0 text-xs font-bold"
                title={language === 'ar' ? 'English' : 'العربية'}
                aria-label={language === 'ar' ? 'Switch to English' : 'تغيير إلى العربية'}
              >
                {language === 'ar' ? 'EN' : 'AR'}
              </button>

              {/* Theme Switcher */}
              <button
                onClick={() => {
                  if (theme === 'light') setTheme('dark');
                  else if (theme === 'dark') setTheme('system');
                  else setTheme('light');
                }}
                className="w-8 h-8 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors flex-shrink-0"
                title={`${t('theme')}: ${t(`theme_${theme}`)}`}
                aria-label={t('theme')}
              >
                {theme === 'light' && <Sun size={16} />}
                {theme === 'dark' && <Moon size={16} />}
                {theme === 'system' && <Smartphone size={16} />}
              </button>

              {/* Notifications */}
              <button
                onClick={() => navigate({ to: '/notifications' })}
                className="w-8 h-8 rounded-full bg-glass border border-border flex items-center justify-center text-primary relative hover:bg-glassHigh transition-colors flex-shrink-0"
                aria-label={t('nav_notifications')}
              >
                <Bell size={16} />
                {hasUnreadNotifications && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
                )}
              </button>
            </div>
          </div>


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

          <div className={`space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${showSearch ? 'max-h-[200px] opacity-100 mt-4 translate-y-0 pointer-events-auto' : 'max-h-0 opacity-0 mt-0 -translate-y-2 pointer-events-none'}`}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('search_placeholder')}
              onSearch={() => navigate({
                to: '/search',
                search: {
                  query: searchQuery || undefined,
                }
              } as any)}
              onFilterClick={() => setIsFilterModalOpen(true)}
            />

            <CategoryChipsRow
              isLoading={isLoadingCategories}
              categories={categories}
              onCategoryClick={(id) => navigate({ to: '/search', search: { category_id: id } } as any)}
            />
          </div>
        </div>{/* /max-w-5xl header inner */}
      </div>
      {/* Company Dashboard */}
      {isCompany && (
        <div className="px-4 mt-6 mb-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-primary">{t('analytics_dashboard') || 'Overview Analytics'}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Active Ads out of total */}
            {(() => {
              const availableAdsCount = companyHomeData?.available_ads_count ?? 0;
              const totalAdsCount = companyHomeData?.total_ads_count ?? 0;
              const availablePercentage = companyHomeData?.available_ads_percentage ?? 0;
              // Every ad is live — surface it with a check instead of a bare "100%".
              const allAdsActive = totalAdsCount > 0 && availableAdsCount >= totalAdsCount;

              return (
                <GlassCard className="p-4 flex items-center gap-4 relative overflow-hidden">
                  <div className={`absolute -end-4 -top-4 w-16 h-16 rounded-full blur-xl pointer-events-none ${allAdsActive ? 'bg-green-500/10' : 'bg-brand-500/10'}`} />
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className={allAdsActive ? 'text-green-500/20' : 'text-brand-500/20'} stroke="currentColor" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path
                        className={`drop-shadow-sm transition-colors ${allAdsActive ? 'text-green-500' : 'text-brand-500'}`}
                        stroke="currentColor" strokeWidth="4"
                        strokeDasharray={`${availablePercentage}, 100`}
                        strokeLinecap="round" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {allAdsActive ? (
                        <CheckCircle size={22} className="text-green-500 animate-in zoom-in duration-500" />
                      ) : (
                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                          <AnimatedNumber value={availablePercentage} />%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isLoadingCompanyHome ? (
                      <Skeleton className="h-6 w-14" />
                    ) : (
                      // dir=ltr keeps the fraction reading available/total; w-fit keeps the
                      // box hugging the inline-start edge in both LTR and RTL.
                      <div className="flex items-baseline gap-0.5 w-fit" dir="ltr">
                        <span className={`text-xl font-bold ${allAdsActive ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                          <AnimatedNumber value={availableAdsCount} />
                        </span>
                        <span className="text-sm font-bold text-secondary">/</span>
                        <span className="text-sm font-bold text-secondary">{totalAdsCount}</span>
                      </div>
                    )}
                    {allAdsActive ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle size={11} className="shrink-0" />
                        <p className="text-[10px] font-bold leading-snug">{t('all_ads_active') || 'All ads are active'}</p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-secondary leading-snug">{t('stat_active_ads') || 'Active Ads'}</p>
                    )}
                  </div>
                </GlassCard>
              );
            })()}

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
            <GlassCard className="p-4 flex flex-col justify-center gap-3 col-span-2 lg:col-span-4 relative overflow-hidden">
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
        <div className="px-4 mt-6 mb-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-primary">{t('analytics_dashboard') || 'Overview Analytics'}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            <GlassCard className="p-4 flex flex-col justify-center gap-3 col-span-2 lg:col-span-4 relative overflow-hidden">
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

      <div className="space-y-8 mt-6 pb-4">
        {/* Nationality Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-bold text-primary">{t('section_nationality')}</h2>
          </div>
          <NationalityRow
            isLoading={isLoadingCountries}
            countries={countries}
            onCountryClick={(nat) => navigate({ to: '/search', search: { country_id: nat.id, country_name: nat.name, country_image: nat.image } } as any)}
          />
        </section>

        {/* Continue watching / history */}
        {(() => {
          const historyData = isCompany ? companyHomeData?.history : homeData?.history;
          return historyData && historyData.length > 0 && (
            <SectionContainer title={t('section_continue')} onViewAll={() => navigate({ to: '/search', search: { filterType: 'continue', history: 1 } })}>
              <HorizontalWorkerRow>
                {historyData.map((worker: any) => (
                  <CompactCard
                    key={worker.id}
                    name={worker.worker_name}
                    image={worker.image}
                    subtitle={worker.country_name}
                    onClick={() => handleWorkerClick(worker.id.toString())}
                  />
                ))}
              </HorizontalWorkerRow>
            </SectionContainer>
          );
        })()}

        {/* Available ads */}
        {(() => {
          const isLoading = isCompany ? isLoadingCompanyHome : isLoadingHome;
          const availableAds = isCompany ? companyHomeData?.available_ads : homeData?.available_ads;
          return isLoading ? (
            <SectionContainer title={t('section_available')} canShowAll={false}>
              <HorizontalWorkerRow>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-32 aspect-[4/5] rounded-2xl shrink-0" />
                ))}
              </HorizontalWorkerRow>
            </SectionContainer>
          ) : (
            availableAds && availableAds.length > 0 && (
              <SectionContainer title={t('section_available')} canShowAll={false}>
                <HorizontalWorkerRow>
                  {availableAds.map((worker: any) => (
                    <CompactCard
                      key={worker.id}
                      name={worker.worker_name}
                      image={worker.image}
                      subtitle={worker.category_name}
                      onClick={() => handleWorkerClick(worker.id.toString())}
                    />
                  ))}
                </HorizontalWorkerRow>
              </SectionContainer>
            )
          );
        })()}

        {/* Latest ads */}
        <SectionContainer title={t('section_newest')} onViewAll={() => navigate({ to: '/search', search: { filterType: 'newest', latest: 1 } } as any)}>
          <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isCompany ? isLoadingCompanyHome : isLoadingHome) ? (
              Array.from({ length: 4 }).map((_, i) => (
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
          <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isCompany ? isLoadingCompanyHome : isLoadingHome) ? (
              Array.from({ length: 4 }).map((_, i) => (
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

        {/* Download the mobile app */}
        <DownloadAppSection />
      </div>
    </div>
  );
};

/** App Store / Google Play badges linking to the Khadam mobile app. */
const DownloadAppSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="px-4">
      <GlassCard className="p-5 relative overflow-hidden">
        <div className="absolute end-0 top-0 bottom-0 w-40 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-500 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary">{t('section_download_app')}</h2>
              <p className="text-[10px] text-secondary mt-0.5">{t('download_app_desc')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <StoreButton
              href={APP_STORE_URL}
              label={t('download_app_store_label')}
              name={t('download_app_store_name')}
              icon={<AppleLogo />}
            />
            <StoreButton
              href={GOOGLE_PLAY_URL}
              label={t('download_google_play_label')}
              name={t('download_google_play_name')}
              icon={<GooglePlayLogo />}
            />
          </div>
        </div>
      </GlassCard>
    </section>
  );
};

const StoreButton: React.FC<{
  href: string;
  label: string;
  name: string;
  icon: React.ReactNode;
}> = ({ href, label, name, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-glass border border-border hover:bg-glassHigh transition-all duration-300"
  >
    <span className="shrink-0 text-primary">{icon}</span>
    <span className="flex flex-col text-start leading-tight">
      <span className="text-[9px] text-secondary">{label}</span>
      <span className="text-sm font-bold text-primary">{name}</span>
    </span>
  </a>
);

const AppleLogo: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.365 1.43c0 1.14-.42 2.2-1.12 3-.79.9-2.07 1.6-3.13 1.51-.13-1.1.43-2.25 1.1-3 .77-.86 2.11-1.5 3.15-1.51zM20.5 17.13c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.93-1-4.02-.99-2.09.01-2.52 1.01-4.06.99-1.73-.01-3.05-1.76-4.04-3.32-2.77-4.36-3.06-9.48-1.35-12.2 1.21-1.93 3.13-3.06 4.93-3.06 1.83 0 2.98 1.01 4.5 1.01 1.47 0 2.36-1.01 4.48-1.01 1.6 0 3.3.87 4.51 2.38-3.97 2.18-3.32 7.85.7 9.73z" />
  </svg>
);

const GooglePlayLogo: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.6 1.84a1.5 1.5 0 0 0-.6 1.2v17.92c0 .5.23.95.6 1.2l10.1-10.16L3.6 1.84z" fill="#34A853" />
    <path d="M17.5 8.35 13.7 12l3.8 3.65 4.02-2.28c.65-.37.65-1.37 0-1.74L17.5 8.35z" fill="#FBBC04" />
    <path d="M3.6 1.84 13.7 12l3.8-3.65L5.3 1.5c-.6-.34-1.24-.16-1.7.34z" fill="#EA4335" />
    <path d="M3.6 22.16c.46.5 1.1.68 1.7.34l12.2-6.85L13.7 12 3.6 22.16z" fill="#4285F4" />
  </svg>
);

const SectionContainer: React.FC<{
  title: string;
  children: React.ReactNode;
  onViewAll?: () => void;
  canShowAll?: boolean;
}> = ({ title, children, onViewAll, canShowAll = true }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
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
  const { mutate: toggleLike, isPending, variables } = useToggleLike();

  const handleToggleLike = (id: number) => {
    toggleLike({ type: 'ad', id });
  };

  const isThisPending = isPending && variables?.id === ad.id;
  const favoriteStatus = isThisPending ? !ad.is_liked : ad.is_liked;

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
              disabled={isThisPending}
              className={`p-1.5 rounded-full transition-all ${isThisPending ? 'opacity-50 scale-90' : 'hover:scale-110'} ${favoriteStatus ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
            >
              <Heart size={16} fill={favoriteStatus ? "currentColor" : "none"} />
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
    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shrink-0 ${isActive
      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
      : 'bg-glass text-secondary border border-border hover:bg-glassHigh'
      }`}
  >
    {label}
  </button>
);

/** Draggable horizontal row of category chips. */
const CategoryChipsRow: React.FC<{
  isLoading: boolean;
  categories: Array<{ id: number; name: string }> | undefined;
  onCategoryClick: (id: number) => void;
}> = ({ isLoading, categories, onCategoryClick }) => {
  const { ref, dragProps, preventClickIfDragged } = useDragScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      {...dragProps}
      className="flex gap-2 overflow-x-auto no-scrollbar pt-1 px-4 cursor-grab select-none"
    >
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl" />
        ))
      ) : (
        categories?.map(cat => (
          <CategoryChip
            key={cat.id}
            label={cat.name}
            isActive={false}
            onClick={preventClickIfDragged(() => onCategoryClick(cat.id))}
          />
        ))
      )}
    </div>
  );
};

/** Draggable row for nationality flags. */
const NationalityRow: React.FC<{
  isLoading: boolean;
  countries: Array<{ id: number; name: string; image: string }> | undefined;
  onCountryClick: (nat: { id: number; name: string; image: string }) => void;
}> = ({ isLoading, countries, onCountryClick }) => {
  const { ref, dragProps, preventClickIfDragged } = useDragScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      {...dragProps}
      className="flex md:flex-wrap gap-6 overflow-x-auto md:overflow-x-visible no-scrollbar px-4 pb-2 cursor-grab select-none"
    >
      {isLoading ? (
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
            onClick={preventClickIfDragged(() => onCountryClick(nat))}
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
  );
};

/** Generic draggable horizontal workers/cards row. */
const HorizontalWorkerRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ref, dragProps } = useDragScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      {...dragProps}
      className="flex md:flex-wrap gap-4 overflow-x-auto md:overflow-x-visible no-scrollbar px-4 cursor-grab select-none"
    >
      {children}
    </div>
  );
};
