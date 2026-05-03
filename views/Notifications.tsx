import React from 'react';
import { ArrowLeft, ArrowRight, Bell, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n';
import { GlassCard, Button } from '../components/GlassUI';
import { useNavigate } from '@tanstack/react-router';
import { useNotifications } from '../features/auth/hooks/useNotifications';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useNotifications();

  const allNotifications = data?.pages.flatMap(page => page.data) || [];

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-secondary">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-5 pt-8 pb-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate({ to: '..' })} 
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
          >
            <BackIcon size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary">{t('notifications_title')}</h1>
        </div>
        <button className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">
          {t('mark_read')}
        </button>
      </div>

      <div className="px-5 mt-6 space-y-3 animate-in fade-in duration-500">
        {allNotifications.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-32 text-secondary">
             <div className="w-20 h-20 rounded-full bg-glass border border-border flex items-center justify-center mb-6">
                <Bell size={40} className="opacity-20" />
             </div>
             <p className="text-sm font-medium">{t('no_notifications')}</p>
             <p className="text-xs opacity-50 mt-1">{t('no_notifications_desc') || 'You will receive updates here'}</p>
           </div>
        ) : (
          <>
            {allNotifications.map(notif => (
              <GlassCard 
                key={notif.id} 
                className={`flex gap-4 group transition-all hover:border-accent/30 ${!notif.read_at ? 'bg-accent/5 border-accent/20' : ''}`}
              >
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 transition-colors ${!notif.read_at ? 'bg-accent animate-pulse' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm ${!notif.read_at ? 'font-bold text-primary' : 'font-medium text-primary/80'}`}>
                      {notif.data.title}
                    </h3>
                    <span className="text-[10px] text-secondary tabular-nums">{notif.created_at_diff}</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                    {notif.data.message}
                  </p>
                </div>
              </GlassCard>
            ))}

            {hasNextPage && (
              <div className="pt-4 flex justify-center">
                <Button 
                  variant="secondary" 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="!h-10 !px-8 text-xs"
                >
                  {isFetchingNextPage ? <Loader2 size={16} className="animate-spin" /> : t('load_more')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};