import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, MapPin, Star, Clock } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useFavorites } from '../FavoritesContext';
import { GlassCard, Avatar, Badge, Skeleton } from '../components/GlassUI';
import { useUserRole } from '../UserRoleContext';

import { useNavigate } from '@tanstack/react-router';
import { useMyLikes, FavoriteAd, FavoriteOffice } from '../features/auth/hooks/useMyLikes';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();
  const { isFavorite, toggleFavorite: toggleFavoriteLocal } = useFavorites();
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';
  const [activeTab, setActiveTab] = useState<'workers' | 'offices'>('workers');

  const { data: favoriteAds, isLoading: isLoadingAds } = useMyLikes('ad');
  const { data: favoriteOffices, isLoading: isLoadingOffices } = useMyLikes('office');
  const { mutate: toggleLike } = useToggleLike();

  const handleToggleLike = (id: number, type: 'ad' | 'office') => {
    toggleLike({ type, id });
    toggleFavoriteLocal(id.toString());
  };

  const isLoading = activeTab === 'workers' ? isLoadingAds : isLoadingOffices;
  const ads = (favoriteAds || []) as FavoriteAd[];
  const offices = (favoriteOffices || []) as FavoriteOffice[];

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
          <h1 className="text-xl font-bold text-primary">{t('favorites') || 'Favorites'}</h1>
        </div>

        <div className="relative flex bg-glass p-1 rounded-xl border border-border">
          {/* Sliding Indicator */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-accent rounded-lg shadow-md transition-all duration-300 ease-in-out ${activeTab === 'workers' ? 'start-1' : 'start-[calc(50%+2px)]'}`}
          />
          <button
            onClick={() => setActiveTab('workers')}
            className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'workers' ? 'text-accent-fg' : 'text-secondary hover:text-primary'}`}
          >
            {t('workers') || 'Workers'}
          </button>
          <button
            onClick={() => setActiveTab('offices')}
            className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'offices' ? 'text-accent-fg' : 'text-secondary hover:text-primary'}`}
          >
            {t('offices') || 'Offices'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-28 rounded-2xl" />
            ))}
          </div>
        ) : activeTab === 'workers' ? (
          ads.length > 0 ? (
            <div className="space-y-4">
              {ads.map(ad => (
                <FavoriteAdCard
                  key={ad.id}
                  ad={ad}
                  onSelect={() => navigate({ to: '/worker/$workerId', params: { workerId: ad.id.toString() } } as any)}
                  t={t}
                  isFavorite={isFavorite(ad.id.toString()) || true}
                  onToggleFavorite={() => handleToggleLike(ad.id, 'ad')}
                  isSeeker={isSeeker}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-secondary space-y-4 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
                <Heart size={32} />
              </div>
              <p>{t('no_favorites') || 'No favorites yet'}</p>
              <button onClick={() => navigate({ to: '/' })} className="text-accent text-sm">{t('browse_workers') || 'Browse workers'}</button>
            </div>
          )
        ) : (
          offices.length > 0 ? (
            <div className="space-y-4">
              {offices.map(office => (
                <FavoriteOfficeCard
                  key={office.id}
                  office={office}
                  onSelect={() => navigate({ to: '/office/$officeId', params: { officeId: office.id.toString() } } as any)}
                  dir={dir}
                  isFavorite={isFavorite(office.id.toString()) || true}
                  onToggleFavorite={() => handleToggleLike(office.id, 'office')}
                  isSeeker={isSeeker}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-secondary space-y-4 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
                <Heart size={32} />
              </div>
              <p>{t('no_favorites') || 'No favorites yet'}</p>
              <button onClick={() => navigate({ to: '/offices' })} className="text-accent text-sm">{t('browse_offices') || 'Browse offices'}</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const FavoriteAdCard: React.FC<{
  ad: FavoriteAd;
  onSelect: () => void;
  t: (k: string) => string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isSeeker: boolean;
}> = ({ ad, onSelect, t, isFavorite, onToggleFavorite, isSeeker }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png';
    e.currentTarget.className += ' grayscale opacity-30 object-contain p-4';
  };

  return (
    <GlassCard onClick={onSelect} className="group overflow-hidden">
      <div className="flex gap-3">
        <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-border relative bg-glass">
          <img
            src={ad.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
            alt={ad.worker_name}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-primary leading-tight line-clamp-1">{ad.worker_name}</h4>
              {isSeeker && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                  className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
                >
                  <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
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

const FavoriteOfficeCard: React.FC<{
  office: FavoriteOffice;
  onSelect: () => void;
  dir: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isSeeker: boolean;
}> = ({ office, onSelect, dir, isFavorite, onToggleFavorite, isSeeker }) => {
  const Icon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <GlassCard
      onClick={onSelect}
      className="flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <Avatar src={office.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'} alt={office.name} size="md" />
        <div>
          <h3 className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{office.name}</h3>
          <div className="flex items-center text-xs text-secondary mt-1">
            <MapPin size={12} className="me-1" />
            {office.state_name}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isSeeker && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center text-secondary group-hover:bg-accent group-hover:text-accent-fg transition-colors">
          <Icon size={16} />
        </div>
      </div>
    </GlassCard>
  );
};
