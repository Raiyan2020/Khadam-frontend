import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';
import { GlassCard, Button, Badge } from '../components/GlassUI';
import { MOCK_ADS, MOCK_WORKERS } from '../constants';
import { useLanguage } from '../i18n';

interface MyAdsProps {
  onPublish: () => void;
  onEditAd: (id: string) => void;
  onSelectWorker: (id: string) => void;
}

export const MyAds: React.FC<MyAdsProps> = ({ onPublish, onEditAd, onSelectWorker }) => {
  const { t, language } = useLanguage();
  
  // Simulate logged-in office (ID: o1)
  const myOfficeId = 'o1';
  const [myAds, setMyAds] = useState(MOCK_ADS.filter(ad => ad.officeId === myOfficeId));

  const handleDelete = (id: string) => {
    setMyAds(prev => prev.filter(ad => ad.id !== id));
  };

  return (
    <div className="pb-24 pt-6 px-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">{t('my_ads_title')}</h1>
        <Button onClick={onPublish} className="!h-9 !px-3 gap-2 !text-xs">
          <Plus size={16} />
          {t('post_new_ad')}
        </Button>
      </div>

      <div className="space-y-4">
        {myAds.length === 0 ? (
          <div className="text-center py-20 text-secondary bg-glass rounded-2xl border border-border">
            <p>{t('no_my_ads')}</p>
          </div>
        ) : (
          myAds.map(ad => {
            const worker = MOCK_WORKERS.find(w => w.id === ad.workerId);
            if (!worker) return null;
            
            return (
              <GlassCard key={ad.id} className="group">
                <div className="flex gap-3 mb-3" onClick={() => onSelectWorker(worker.id)}>
                   <img 
                      src={worker.photo} 
                      alt={worker.name[language]} 
                      className="w-16 h-16 object-cover rounded-lg bg-surface"
                    />
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                         <h3 className="text-sm font-bold text-primary line-clamp-1">{ad.title[language]}</h3>
                         <Badge color={ad.featured ? 'accent' : 'neutral'}>
                            {ad.featured ? 'Featured' : 'Active'}
                         </Badge>
                       </div>
                       <p className="text-xs text-secondary mt-1">{worker.name[language]}</p>
                       <p className="text-[10px] text-secondary mt-0.5">{ad.postedAt}</p>
                    </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-border">
                   <button 
                     className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-secondary hover:text-primary hover:bg-glassHigh rounded-lg transition-colors"
                     onClick={() => onSelectWorker(worker.id)}
                   >
                      <Eye size={14} /> {t('action_view')}
                   </button>
                   <button 
                     className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-secondary hover:text-accent hover:bg-glassHigh rounded-lg transition-colors"
                     onClick={() => onEditAd(ad.id)}
                   >
                      <Edit2 size={14} /> {t('action_edit')}
                   </button>
                   <button 
                     className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-secondary hover:text-red-500 hover:bg-glassHigh rounded-lg transition-colors"
                     onClick={() => handleDelete(ad.id)}
                   >
                      <Trash2 size={14} /> {t('action_delete')}
                   </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
};