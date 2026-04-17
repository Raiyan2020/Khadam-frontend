import React from 'react';
import { ArrowLeft, ArrowRight, MapPin, MessageCircle, Phone, Globe, Heart } from 'lucide-react';
import { GlassCard, Button, Avatar } from '../components/GlassUI';
import { MOCK_OFFICES, MOCK_ADS, MOCK_WORKERS } from '../constants';
import { useUserRole } from '../UserRoleContext';
import { useLanguage } from '../i18n';
import { useFavorites } from '../FavoritesContext';

import { useNavigate, useParams } from '@tanstack/react-router';

export const OfficeProfile: React.FC = () => {
  const { officeId } = useParams({ strict: false }) as { officeId: string };
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';
  const office = MOCK_OFFICES.find(o => o.id === officeId);

  if (!office) return <div className="p-10 text-center">{t('no_workers')}</div>;

  const officeAds = MOCK_ADS.filter(a => a.officeId === officeId);
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  // Order: WhatsApp -> Location -> Call -> Website
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
      href: office.mapsUrl || null,
      active: !!office.mapsUrl
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

  return (
    <div className="pb-20">
      {/* Header Image Area */}
      <div className="h-44 w-full relative">
        <img src={office.coverImage} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        
        <div className="absolute top-5 start-5 z-20">
           <button 
             onClick={() => { if (window.history.length > 1) { navigate({ to: '..' }); } else { navigate({ to: '/' }); } }} 
             className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/30 transition-colors"
           >
            <BackIcon size={20} />
          </button>
        </div>

        <div className="absolute top-5 end-5 z-20">
          {isSeeker && (
            <button 
              onClick={() => toggleFavorite(office.id)} 
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${isFavorite(office.id) ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-black/20 text-white border-white/10 hover:bg-black/30'}`}
            >
              <Heart size={20} fill={isFavorite(office.id) ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Office Profile Details */}
      <div className="-mt-12 px-5 relative z-10">
        {/* Avatar Section */}
        <div className="mb-4">
           <Avatar 
             src={office.avatar} 
             alt={office.name[language]} 
             size="xl" 
             className="border-4 border-background shadow-lg shrink-0" 
           />
        </div>

        {/* Office Info Block */}
        <div className="space-y-3">
           <div className="flex items-center gap-2">
             <h1 className="text-2xl font-bold text-primary tracking-tight">{office.name[language]}</h1>
           </div>
           
           <p className="text-sm text-secondary leading-relaxed max-w-[95%]">
             {office.bio[language]}
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
        <div className="mt-8 border-t border-border/50 pt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-primary">{t('tab_ads')}</h2>
            <span className="text-xs text-secondary font-medium bg-glass px-2 py-1 rounded-md border border-border">
              {officeAds.length} {t('nav_cats')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {officeAds.map(ad => {
               const worker = MOCK_WORKERS.find(w => w.id === ad.workerId);
               if (!worker) return null;

               return (
                 <div 
                   key={ad.id} 
                   onClick={() => navigate({ to: '/worker/$workerId', params: { workerId: worker.id } } as any)} 
                   className="cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-300"
                 >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-border bg-glass shadow-sm">
                       <img 
                         src={worker.photo} 
                         alt={worker.name[language]} 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                         loading="lazy"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                       
                       <div className="absolute bottom-3 start-3 end-3 space-y-1">
                          <p className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                            {ad.title[language]}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-white/70 font-medium">{worker.nationality[language]}</span>
                            <span className="text-[10px] text-brand-300 font-bold">{worker.salary} {t('kwd')}</span>
                          </div>
                       </div>
                    </div>
                 </div>
               );
            })}
            
            {officeAds.length === 0 && (
              <div className="col-span-2 py-16 flex flex-col items-center justify-center bg-glass rounded-3xl border border-dashed border-border">
                <p className="text-secondary text-sm font-medium">{t('no_ads')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
