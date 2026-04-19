import React, { useState } from 'react';
import { Award, Check, ChevronLeft, ChevronRight, Gem, Zap } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../i18n';
import { GlassCard, Badge } from '../components/GlassUI';

interface SubscriptionPlan {
  id: string;
  nameKey: string;
  durationKey: string;
  priceKey: string;
  advantagesKeys: string[];
  isPopular?: boolean;
  icon: React.ReactNode;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    nameKey: 'plan_basic_name',
    durationKey: 'plan_basic_duration',
    priceKey: 'plan_basic_price',
    advantagesKeys: ['adv_basic_1', 'adv_basic_2', 'adv_basic_3'],
    icon: <Award size={24} className="text-zinc-400" />
  },
  {
    id: 'pro',
    nameKey: 'plan_pro_name',
    durationKey: 'plan_pro_duration',
    priceKey: 'plan_pro_price',
    advantagesKeys: ['adv_pro_1', 'adv_pro_2', 'adv_pro_3', 'adv_pro_4'],
    isPopular: true,
    icon: <Zap size={24} className="text-brand-400" />
  },
  {
    id: 'premium',
    nameKey: 'plan_premium_name',
    durationKey: 'plan_premium_duration',
    priceKey: 'plan_premium_price',
    advantagesKeys: ['adv_premium_1', 'adv_premium_2', 'adv_premium_3', 'adv_premium_4', 'adv_premium_5'],
    icon: <Gem size={24} className="text-purple-400" />
  }
];

export const Subscriptions: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Header */}
      <div className="relative sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => navigate({ to: '/' })}
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary"
          >
            {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-bold text-primary">{t('nav_subscriptions') || 'Subscriptions'}</h1>
        <p className="text-sm text-secondary mt-1">{t('subs_subtitle') || 'Select the perfect package for your office'}</p>
      </div>

      <div className="p-5 space-y-6">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          
          return (
            <GlassCard 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 relative transition-all duration-300 border-2 cursor-pointer
                ${isSelected ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-transparent hover:border-brand-500/50'}
                ${plan.isPopular ? 'overflow-visible' : 'overflow-hidden'}
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 transform inset-x-0 flex justify-center z-10 animate-in fade-in slide-in-from-bottom-2">
                  <Badge color="accent" className="shadow-lg px-4 py-1 text-[10px] uppercase font-bold tracking-widest">{t('most_popular') || 'Most Popular'}</Badge>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6 mt-2 relative z-0">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-brand-500/20 shadow-inner' : 'bg-glassHigh'}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-primary">{t(plan.nameKey as any) || plan.nameKey}</h3>
                    <p className="text-xs text-secondary font-medium">{t(plan.durationKey as any) || '1 Month'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-brand-500">{t(plan.priceKey as any) || 'Free'}</span>
                </div>
              </div>

              {/* Dividers */}
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full my-4 opacity-50" />

              <ul className="space-y-3 relative z-0">
                {plan.advantagesKeys.map((advKey, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm text-secondary font-medium leading-relaxed">{t(advKey as any) || 'Feature Included'}</span>
                  </li>
                ))}
              </ul>

              {isSelected && (
                <button 
                  onClick={() => navigate({ to: '/checkout', search: { planId: plan.id } as any })}
                  className="w-full mt-6 py-3.5 rounded-xl bg-brand-500 text-white font-bold tracking-wide shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-sm"
                >
                  {t('subscribe_now') || 'Subscribe Now'}
                </button>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
