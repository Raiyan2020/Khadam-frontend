import React, { useState } from 'react';
import { Check, ArrowLeft, ArrowRight, Zap, Gem, Award, Loader2 } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { useNavigate } from '@tanstack/react-router';
import { usePackages } from '../features/auth/hooks/usePackages';

export const Subscriptions: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { data: packages, isLoading } = usePackages();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const getPackageIcon = (index: number) => {
    switch (index) {
      case 0: return <Award size={24} className="text-zinc-400" />;
      case 1: return <Zap size={24} className="text-brand-400" />;
      default: return <Gem size={24} className="text-purple-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-secondary">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Header */}
      <div className="relative sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate({ to: '/profile' })}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-glassHigh transition-colors"
          >
            {dir === 'rtl' ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <h1 className="text-xl font-bold text-primary">{t('subscriptions')}</h1>
          <div className="w-10" />
        </div>
        <p className="text-xs text-secondary text-center">
          {t('choose_plan_desc') || 'Choose the best plan for your office'}
        </p>
      </div>

      <div className="px-5 pt-8 space-y-6">
        {packages?.map((pkg, index) => (
          <GlassCard
            key={pkg.id}
            className={`relative overflow-hidden transition-all duration-300 ${selectedPlan === pkg.id
              ? 'ring-2 ring-brand-400 border-transparent bg-brand-500/5'
              : 'hover:border-brand-400/30'
              }`}
            onClick={() => setSelectedPlan(pkg.id)}
          >
            {/* Popular Badge */}
            {index === 1 && (
              <div className="absolute top-0 end-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                {t('popular') || 'Popular'}
              </div>
            )}

            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${index === 1 ? 'bg-brand-500/10' : index === 2 ? 'bg-purple-500/10' : 'bg-zinc-500/10'
                }`}>
                {getPackageIcon(index)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-brand-500">{pkg.price}</span>
                  <span className="text-xs text-secondary font-medium">KWD / {pkg.duration} {t('months') || 'Months'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {pkg.features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-green-500" />
                  </div>
                  <span className="text-sm text-secondary font-medium">{feature.description}</span>
                </div>
              ))}
            </div>

            <Button
              fullWidth
              onClick={() => navigate({ to: '/checkout', search: { planId: pkg.id.toString() } })}
              variant={selectedPlan === pkg.id ? 'primary' : 'secondary'}
              className="h-12 text-sm font-bold"
            >
              {selectedPlan === pkg.id ? t('selected') || 'Selected' : t('choose_plan') || 'Choose Plan'}
            </Button>
          </GlassCard>
        ))}

        {/* Support Note */}
        <button
          onClick={() => navigate({ to: '/help-support' })}
          className="p-4 cursor-pointer w-full bg-glass border border-border rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primary">{t('need_custom_plan') || 'Need a custom plan?'}</h4>
            <p className="text-[10px] text-secondary mt-0.5">{t('contact_support_plan') || 'Contact our support for enterprise solutions'}</p>
          </div>
        </button>
      </div>
    </div>
  );
};
