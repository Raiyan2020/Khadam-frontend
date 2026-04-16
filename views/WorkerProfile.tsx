
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, Share2, MapPin, Globe, Clock, CheckCircle, Wallet, Heart } from 'lucide-react';
import { GlassCard, Button, Badge } from '../components/GlassUI';
import { useFavorites } from '../FavoritesContext';
import { Worker, Office, ServiceCategory } from '../types';
import { MOCK_OFFICES, MOCK_WORKERS } from '../constants';
import { useLanguage } from '../i18n';

interface WorkerProfileProps {
  workerId: string;
  onBack: () => void;
  onNavigateOffice: (id: string) => void;
}

export const WorkerProfile: React.FC<WorkerProfileProps> = ({ workerId, onBack, onNavigateOffice }) => {
  const { t, dir, language } = useLanguage();
  const worker = MOCK_WORKERS.find(w => w.id === workerId);
  const office = worker ? MOCK_OFFICES.find(o => o.id === worker.officeId) : null;
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(workerId);

  if (!worker || !office) return <div>Worker not found</div>;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png';
    e.currentTarget.className += ' grayscale opacity-20 object-contain p-10';
  };

  const whatsappLink = `https://wa.me/${office.phone}?text=${encodeURIComponent(`Hi, I am interested in ${worker.name[language]} (ID: ${worker.id}) from your listings.`)}`;

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="relative pb-24">
      {/* Top Image Area */}
      <div className="relative h-[480px] w-full bg-glass overflow-hidden">
        <img 
          src={worker.photo} 
          alt={worker.name[language]} 
          onError={handleImageError}
          className="w-full h-full object-cover" 
        />
        
        {/* Bottom-focused gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.62) 100%)' }}
        />
        
        {/* Nav Header */}
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-20">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors">
            <BackIcon size={20} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleFavorite(workerId)} 
              className={`w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 transition-colors ${favorite ? 'text-red-500 hover:bg-black/40' : 'text-white hover:bg-black/40'}`}
            >
              <Heart size={20} fill={favorite ? "currentColor" : "none"} />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Improved Info Container Area */}
        <div className="absolute bottom-6 start-5 end-5 z-10 flex flex-col items-start gap-3">
           {/* Glass Text Container */}
           <div 
             className="max-w-[78%] p-[10px_12px] rounded-[14px] border border-white/20 backdrop-blur-[6px] animate-in fade-in slide-in-from-bottom-3 duration-700"
             style={{ background: 'rgba(10,16,28,0.42)' }}
           >
             <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight line-clamp-2">
               {worker.name[language]}
             </h1>
             <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
               <span className="text-white/90 text-xs sm:text-sm font-medium">
                 {worker.specialty[language]}
               </span>
               <span className="w-1 h-1 rounded-full bg-white/40" />
               <span className="text-white/90 text-xs sm:text-sm">
                 {worker.age} {t('years_old')}
               </span>
             </div>
           </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        <GlassCard onClick={() => onNavigateOffice(office.id)} className="flex items-center justify-between !py-3 hover:border-brand-300 transition-colors">
          <div className="flex items-center gap-3">
            <img src={office.avatar} alt={office.name[language]} className="w-10 h-10 rounded-full border border-border" />
            <div>
              <p className="text-xs text-secondary">{t('managed_by')}</p>
              <h3 className="text-sm font-semibold text-primary">{office.name[language]}</h3>
            </div>
          </div>
          <div className="text-brand-500">
            <CheckCircle size={18} />
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Globe size={18} />} label={t('nationality')} value={worker.nationality[language]} />
          <StatCard icon={<Clock size={18} />} label={t('experience')} value={`${worker.experienceYears} ${t('exp_years')}`} />
          <StatCard icon={<Wallet size={18} />} label={t('salary')} value={`${worker.salary} KWD`} />
          <StatCard icon={<MapPin size={18} />} label={t('location')} value={worker.city[language]} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{t('details')}</h3>
          <div className="bg-surface rounded-2xl p-4 border border-border space-y-3 shadow-sm">
             <div className="flex justify-between py-2 border-b border-border">
                <span className="text-secondary text-sm">{t('specialty')}</span>
                <span className="text-primary text-sm font-medium text-end">{worker.specialty[language]}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-border">
                <span className="text-secondary text-sm">{t('languages')}</span>
                <span className="text-primary text-sm font-medium text-end">{worker.languages.map(l => l[language]).join(', ')}</span>
             </div>
             <div className="flex justify-between py-2">
                <span className="text-secondary text-sm">{t('gender')}</span>
                <span className="text-primary text-sm font-medium text-end">{worker.gender === 'Female' ? t('gender_female') : t('gender_male')}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[85px] sm:absolute sm:bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pointer-events-none flex justify-center w-full max-w-[430px] mx-auto z-30">
        <div className="w-full pointer-events-auto">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button fullWidth variant="primary" className="gap-2">
               <MessageCircle size={20} />
               {t('contact_whatsapp')}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-glass border border-border rounded-2xl p-3 flex flex-col gap-1 hover:border-brand-300 transition-colors">
    <div className="text-brand-500 opacity-80 mb-1">{icon}</div>
    <span className="text-[10px] text-secondary uppercase tracking-wider">{label}</span>
    <span className="text-sm font-semibold text-primary truncate">{value}</span>
  </div>
);
