'use client';

import React from 'react';
import { MapPin, ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { GlassCard, Avatar } from '../components/GlassUI';
import { MOCK_OFFICES } from '../constants';
import { useLanguage } from '../i18n';
import { useFavorites } from '../FavoritesContext';
import { useRouter } from 'next/navigation';

export const OfficesList: React.FC = () => {
  const router = useRouter();
  const { t, language, dir } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const Icon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="pb-10 pt-6 px-5">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary">{t('offices_title')}</h1>
        <p className="text-xs text-secondary">{t('browse_offices')}</p>
      </div>

      <div className="space-y-4">
        {MOCK_OFFICES.map(office => (
          <GlassCard 
            key={office.id} 
            onClick={() => router.push(`/office/${office.id}`)} 
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
                onClick={(e) => { e.stopPropagation(); toggleFavorite(office.id); }}
                className={`p-2 rounded-full transition-colors ${isFavorite(office.id) ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
              >
                <Heart size={18} fill={isFavorite(office.id) ? "currentColor" : "none"} />
              </button>
              <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center text-secondary group-hover:bg-accent group-hover:text-accent-fg transition-colors">
                <Icon size={16} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};