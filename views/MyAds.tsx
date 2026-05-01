import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Eye, Loader2 } from 'lucide-react';
import { GlassCard, Button, Badge, Switch, Modal } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { useNavigate } from '@tanstack/react-router';
import { useMyAds, useToggleAdAvailability, useDeleteAd } from '../features/auth/hooks/useMyAds';

export const MyAds: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: myAdsData, isLoading } = useMyAds();
  const toggleAvailability = useToggleAdAvailability();
  const deleteAd = useDeleteAd();

  const [adToDelete, setAdToDelete] = useState<number | null>(null);

  const handleDeleteConfirm = () => {
    if (adToDelete) {
      deleteAd.mutate(adToDelete, {
        onSuccess: () => setAdToDelete(null),
      });
    }
  };

  const handleToggleActive = (id: number) => {
    toggleAvailability.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const ads = myAdsData?.data || [];

  return (
    <div className="pb-24 pt-6 px-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">{t('my_ads_title')}</h1>
        <Button onClick={() => navigate({ to: '/publish-ad' })} className="!h-9 !px-3 gap-2 !text-xs">
          <Plus size={16} />
          {t('post_new_ad')}
        </Button>
      </div>

      <div className="space-y-4">
        {ads.length === 0 ? (
          <div className="text-center py-20 text-secondary bg-glass rounded-2xl border border-border">
            <p>{t('no_my_ads')}</p>
          </div>
        ) : (
          ads.map(ad => (
            <GlassCard key={ad.id} className="group">
              <div className="flex gap-3 mb-3" onClick={() => navigate({ to: '/worker/$workerId', params: { workerId: String(ad.id) } } as any)}>
                <img
                  src={ad.image}
                  alt={ad.worker_name}
                  className="w-16 h-16 object-cover rounded-lg bg-surface"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-primary line-clamp-1">{ad.title}</h3>
                    <Badge color={ad.is_available ? 'accent' : 'neutral'}>
                      {ad.is_available ? t('available') : t('reserved')}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-2 justify-between">
                    <div className="flex gap-2 flex-col">
                      <p className="text-xs text-secondary mt-1">{ad.worker_name}</p>
                      <p className="text-[10px] text-secondary mt-0.5">{ad.created_at}</p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={ad.is_available === 1}
                        onChange={() => handleToggleActive(ad.id)}
                        disabled={toggleAvailability.isPending && toggleAvailability.variables === ad.id}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-secondary hover:text-primary hover:bg-glassHigh rounded-lg transition-colors"
                  onClick={() => navigate({ to: '/worker/$workerId', params: { workerId: String(ad.id) } } as any)}
                >
                  <Eye size={14} /> {t('action_view')}
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-secondary hover:text-accent hover:bg-glassHigh rounded-lg transition-colors"
                  onClick={() => navigate({ to: '/edit-ad/$adId', params: { adId: String(ad.id) } } as any)}
                >
                  <Edit2 size={14} /> {t('action_edit')}
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-secondary hover:text-red-500 hover:bg-glassHigh rounded-lg transition-colors"
                  onClick={() => setAdToDelete(ad.id)}
                >
                  <Trash2 size={14} /> {t('action_delete')}
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={adToDelete !== null}
        onClose={() => setAdToDelete(null)}
        title={t('confirm_delete')}
        description={t('delete_ad_warning')}
        variant="danger"
      >
        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setAdToDelete(null)}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            fullWidth
            className="!bg-red-500 !shadow-red-500/20 !text-white"
            onClick={handleDeleteConfirm}
            disabled={deleteAd.isPending}
          >
            {deleteAd.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('action_delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};