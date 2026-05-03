import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, MessageCircle, Phone, Globe, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard, Avatar, Skeleton } from '../components/GlassUI';
import { useUserRole } from '../UserRoleContext';
import { useLanguage } from '../i18n';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useOfficeDetails, useOfficeAds } from '../features/auth/hooks/useOfficeDetails';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';

export const OfficeProfile: React.FC = () => {
  const { officeId } = useParams({ strict: false }) as { officeId: string };
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';



  const [page, setPage] = useState(1);

  const { data: office, isLoading: isLoadingOffice } = useOfficeDetails(officeId);
  const { data: adsResponse, isLoading: isLoadingAds } = useOfficeAds(officeId, page);
  const { mutate: toggleLike, isPending, variables } = useToggleLike();

  const ads = adsResponse?.data || [];
  const pagination = adsResponse?.pagination;
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  if (isLoadingOffice) {
    return (
      <div className="pb-20 animate-pulse">
        <Skeleton className="h-44 w-full" />
        <div className="-mt-12 px-5">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-background" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-8 w-1/2 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!office) return <div className="p-10 text-center">{t('no_workers')}</div>;

  const contactActions = [
    {
      id: 'whatsapp',
      icon: <MessageCircle size={22} />,
      label: 'WhatsApp',
      href: office.whatsapp ? `https://wa.me/${office.whatsapp}` : null,
      active: !!office.whatsapp
    },
    {
      id: 'location',
      icon: <MapPin size={22} />,
      label: 'Location',
      href: office.map_desc || null, // Assuming map_desc contains URL or using a fallback
      active: !!office.map_desc
    },
    {
      id: 'call',
      icon: <Phone size={22} />,
      label: 'Call',
      href: office.phone ? `tel:${office.phone}` : null,
      active: !!office.phone
    },
    {
      id: 'website',
      icon: <Globe size={22} />,
      label: 'Website',
      href: office.website || null,
      active: !!office.website
    }
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Smooth scroll to ads section top
    const adsSection = document.getElementById('ads-section');
    if (adsSection) {
      adsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const handleToggleLike = () => {
    toggleLike({ type: 'office', id: office.id });
  };

  const isThisPending = isPending && variables?.id === office.id;
  const isFavorited = isThisPending ? !office.is_liked : office.is_liked;

  return (
    <div className="pb-20">
      {/* Header Image Area */}
      <div className="h-44 w-full relative">
        <img
          src={office.cover_image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
          alt="Cover"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'; }}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

        <div className="absolute top-5 start-5 z-20">
          <button
            onClick={() => { if (window.history.length > 1) { history.back(); } else { navigate({ to: '/' }); } }}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/30 transition-colors"
          >
            <BackIcon size={20} />
          </button>
        </div>

        <div className="absolute top-5 end-5 z-20">
          {isSeeker && (
            <button
              onClick={handleToggleLike}
              disabled={isThisPending}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${isThisPending ? 'opacity-50 scale-90' : 'hover:scale-110'} ${isFavorited ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-black/20 text-white border-white/10 hover:bg-black/30'}`}
            >
              <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Office Profile Details */}
      <div className="-mt-12 px-5 relative z-10">
        {/* Avatar Section */}
        <div className="mb-4">
          <Avatar
            src={office.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
            alt={office.name}
            size="xl"
            className="border-4 border-background shadow-lg shrink-0"
          />
        </div>

        {/* Office Info Block */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary tracking-tight">{office.name}</h1>
          </div>

          <p className="text-sm text-secondary leading-relaxed max-w-[95%] overflow-x-hidden">
            {office.description || t('no_description')}
          </p>
        </div>

        {/* Dedicated Actions Row */}
        <div className="mt-3 mb-4 flex flex-wrap gap-[10px] justify-start">
          {contactActions.map(action => (
            action.active ? (
              <a
                key={action.id}
                href={action.href!}
                target="_blank"
                rel="noreferrer"
                aria-label={action.label}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-full transition-transform active:scale-95"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-glass border border-border flex items-center justify-center text-primary shadow-sm transition-colors active:bg-glassHigh">
                  {action.icon}
                </div>
              </a>
            ) : null
          ))}
        </div>

        {/* Listings Section */}
        <div id="ads-section" className="mt-8 border-t border-border/50 pt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-primary">{t('tab_ads')}</h2>
            <span className="text-xs text-secondary font-medium bg-glass px-2 py-1 rounded-md border border-border">
              {office.numbers_of_ads} {t('nav_cats')}
            </span>
          </div>

          {isLoadingAds ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : ads.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {ads.map(ad => (
                  <div
                    key={ad.id}
                    onClick={() => navigate({ to: '/worker/$workerId', params: { workerId: ad.id.toString() } } as any)}
                    className="cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-border bg-glass shadow-sm">
                      <img
                        src={ad.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
                        alt={ad.worker_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'; }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      <div className="absolute bottom-3 start-3 end-3 space-y-1">
                        <p className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                          {ad.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/70 font-medium">{ad.country_name}</span>
                          <span className="text-[10px] text-brand-300 font-bold">{ad.salary} {t('kwd')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="w-9 h-9 rounded-xl bg-glass border border-border flex items-center justify-center text-primary disabled:opacity-30 transition-all hover:bg-glassHigh"
                  >
                    {dir === 'rtl' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, i) => {
                      let pageNum = page;
                      if (page <= 3) pageNum = i + 1;
                      else if (page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i;
                      else pageNum = page - 2 + i;

                      if (pageNum <= 0 || pageNum > pagination.last_page) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${page === pageNum
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
                    disabled={page === pagination.last_page}
                    onClick={() => handlePageChange(page + 1)}
                    className="w-9 h-9 rounded-xl bg-glass border border-border flex items-center justify-center text-primary disabled:opacity-30 transition-all hover:bg-glassHigh"
                  >
                    {dir === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center bg-glass rounded-3xl border border-dashed border-border">
              <p className="text-secondary text-sm font-medium">{t('no_ads')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
