import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, Share2, MapPin, Globe, Clock, CheckCircle, Wallet, Heart } from 'lucide-react';
import { GlassCard, Button, Skeleton } from '../components/GlassUI';
import { useUserRole } from '../UserRoleContext';
import { useLanguage } from '../i18n';
import { useAdDetails } from '../features/auth/hooks/useAdDetails';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';
import { useWhatsappTransfer } from '../features/auth/hooks/useWhatsappTransfer';

export const WorkerProfile: React.FC = () => {
  const { workerId } = useParams({ strict: false }) as { workerId: string };
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';

  const { data: worker, isLoading, error } = useAdDetails(workerId);
  const { mutate: toggleLike, isPending, variables } = useToggleLike();
  const { mutate: recordTransfer, isPending: isRecordingTransfer } = useWhatsappTransfer();

  const handleToggleLike = () => {
    const id = parseInt(workerId);
    if (!isNaN(id)) {
      toggleLike({ type: 'ad', id });
    }
  };

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [workerId]);



  const isThisPending = isPending && variables?.id === parseInt(workerId);
  const favoriteStatus = isThisPending ? !worker?.is_liked : worker?.is_liked;

  const handleWhatsappContact = () => {
    if (!worker) return;
    recordTransfer({
      company_id: worker.office.id,
      ad_id: worker.id
    });
    const whatsappLink = `https://wa.me/${worker.office.whatsapp}?text=${encodeURIComponent(`Hi, I am interested in ${worker.worker_name} (ID: ${worker.id}) from your listings.`)}`;
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = t('share_text');

    try {
      if (navigator.share) {
        await navigator.share({
          title: worker?.worker_name || t('app_name'),
          text,
          url
        });
        return;
      }
    } catch {
      // ignore share error (e.g. user cancelled)
    }

    try {
      await navigator.clipboard.writeText(url);
      import('sonner').then(({ toast }) => toast.success(t('link_copied')));
    } catch {
      alert(t('copy_failed') + url);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[480px] w-full" />
        <div className="px-5 space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !worker) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 text-center space-y-4">
      <h2 className="text-xl font-bold text-primary">{t('worker_not_found') || 'Worker not found'}</h2>
      <Button onClick={() => navigate({ to: '/' })} variant="primary">{t('back_home') || 'Back Home'}</Button>
    </div>
  );

  const office = worker.office;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png';
    e.currentTarget.className += ' grayscale opacity-20 object-contain p-10';
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="relative pb-24">
      {/* Top Image Area */}
      <div className="relative h-[480px] w-full bg-glass overflow-hidden">
        <img
          src={worker.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'}
          alt={worker.worker_name}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />

        {/* Bottom-focused gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.62) 100%)' }}
        />

        {/* Nav Header */}
        <div className="fixed top-0 left-0 right-0 p-5 flex justify-between items-center z-40 pointer-events-none">
          <div className="pointer-events-auto">
            <button onClick={() => { if (window.history.length > 1) { history.back(); } else { navigate({ to: '/' }); } }} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors">
              <BackIcon size={20} />
            </button>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            {isSeeker && (
              <button
                onClick={handleToggleLike}
                disabled={isThisPending}
                className={`w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all ${isThisPending ? 'opacity-50 scale-90' : 'hover:scale-110'} ${favoriteStatus ? 'text-red-500' : 'text-white'}`}
              >
                <Heart size={20} fill={favoriteStatus ? "currentColor" : "none"} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors"
            >
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
              {worker.worker_name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                {worker.category_name}
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
        <GlassCard onClick={() => navigate({ to: '/office/$officeId', params: { officeId: office.id } } as any)} className="flex items-center justify-between !py-3 hover:border-brand-300 transition-colors">
          <div className="flex items-center gap-3">
            <img src={office.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'} alt={office.name} className="w-10 h-10 rounded-full border border-border" />
            <div>
              <p className="text-xs text-secondary">{t('managed_by')}</p>
              <h3 className="text-sm font-semibold text-primary">{office.name}</h3>
            </div>
          </div>
          <div className="text-brand-500">
            <CheckCircle size={18} />
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Globe size={18} />} label={t('nationality')} value={worker.country_name} />
          <StatCard icon={<Clock size={18} />} label={t('experience')} value={`${worker.years_experience} ${t('exp_years')}`} />
          <StatCard icon={<Wallet size={18} />} label={t('salary')} value={`${worker.salary} KWD`} />
          <StatCard icon={<MapPin size={18} />} label={t('available')} value={worker.is_available ? t('yes') : t('no')} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{t('details')}</h3>
          <div className="bg-surface rounded-2xl p-4 border border-border space-y-3 shadow-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-secondary text-sm">{t('specialty')}</span>
              <span className="text-primary text-sm font-medium text-end">{worker.category_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-secondary text-sm">{t('languages')}</span>
              <span className="text-primary text-sm font-medium text-end">{worker.languages.map(l => l.name).join(', ')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary text-sm">{t('gender')}</span>
              <span className="text-primary text-sm font-medium text-end">{worker.gender}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[85px] sm:absolute sm:bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pointer-events-none flex justify-center w-full max-w-[430px] mx-auto z-30">
        <div className="w-full pointer-events-auto">
          <Button
            fullWidth
            variant="primary"
            className="gap-2"
            onClick={handleWhatsappContact}
            disabled={isRecordingTransfer}
          >
            <MessageCircle size={20} />
            {t('contact_whatsapp')}
          </Button>
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
