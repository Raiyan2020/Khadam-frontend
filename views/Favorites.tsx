'use client';

import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useFavorites } from '../FavoritesContext';
import { MOCK_WORKERS, MOCK_OFFICES, MOCK_ADS } from '../constants';
import { Worker, Office } from '../types';
import { GlassCard, Avatar, Badge } from '../components/GlassUI';
import { useRouter } from 'next/navigation';

export const Favorites: React.FC = () => {
  const router = useRouter();
  const { t, dir, language } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<'workers' | 'offices'>('workers');

  const favoriteWorkers = MOCK_WORKERS.filter(w => favorites.includes(w.id));
  const favoriteOffices = MOCK_OFFICES.filter(o => favorites.includes(o.id));

  return (
    <div className="pb-10 min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 space-y-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
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
        {activeTab === 'workers' ? (
          favoriteWorkers.length > 0 ? (
            <div className="space-y-4">
              {favoriteWorkers.map(worker => (
                <FullListingCard 
                  key={worker.id} 
                  worker={worker} 
                  onSelect={() => router.push(`/worker/${worker.id}`)}
                  onSelectOffice={(id) => router.push(`/office/${id}`)}
                  language={language}
                  t={t}
                  dir={dir}
                  isFavorite={isFavorite(worker.id)}
                  onToggleFavorite={() => toggleFavorite(worker.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-secondary space-y-4 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
                <Heart size={32} />
              </div>
              <p>{t('no_favorites') || 'No favorites yet'}</p>
              <button onClick={() => router.back()} className="text-accent text-sm">{t('browse_workers') || 'Browse workers'}</button>
            </div>
          )
        ) : (
          favoriteOffices.length > 0 ? (
            <div className="space-y-4">
              {favoriteOffices.map(office => (
                <FavoriteOfficeCard 
                  key={office.id} 
                  office={office} 
                  onSelect={() => router.push(`/office/${office.id}`)}
                  language={language}
                  dir={dir}
                  isFavorite={isFavorite(office.id)}
                  onToggleFavorite={() => toggleFavorite(office.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-secondary space-y-4 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
                <Heart size={32} />
              </div>
              <p>{t('no_favorites') || 'No favorites yet'}</p>
              <button onClick={() => router.back()} className="text-accent text-sm">{t('browse_offices') || 'Browse offices'}</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const FullListingCard: React.FC<{ 
  worker: Worker; 
  onSelect: () => void; 
  onSelectOffice: (id: string) => void; 
  language: string; 
  t: (k: string) => string;
  dir: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}> = ({ worker, onSelect, onSelectOffice, language, t, dir, isFavorite, onToggleFavorite }) => {
  const office = MOCK_OFFICES.find(o => o.id === worker.officeId);
  const ad = MOCK_ADS.find(a => a.workerId === worker.id);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png';
    e.currentTarget.className += ' grayscale opacity-30 object-contain p-4';
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
              <span>{office?.location[language]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <Badge color="neutral">{worker.id}</Badge>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-border relative">
          <img 
            src={worker.photo} 
            alt={worker.name[language]} 
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
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
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const FavoriteOfficeCard: React.FC<{ 
  office: Office; 
  onSelect: () => void; 
  language: string; 
  dir: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}> = ({ office, onSelect, language, dir, isFavorite, onToggleFavorite }) => {
  const Icon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <GlassCard 
      onClick={onSelect} 
      className="flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <Avatar src={office.avatar} alt={office.name[language]} size="md" />
        <div>
          <h3 className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{office.name[language]}</h3>
          <div className="flex items-center text-xs text-secondary mt-1">
            <MapPin size={12} className="me-1" />
            {office.location[language]}
          </div>
          <div className="flex items-center text-xs text-secondary mt-0.5">
            <Star size={12} className="me-1 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-primary me-1">{office.rating}</span>
            <span>({office.reviewCount})</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center text-secondary group-hover:bg-accent group-hover:text-accent-fg transition-colors">
          <Icon size={16} />
        </div>
      </div>
    </GlassCard>
  );
};
