import React from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, ScrollText, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../i18n';
import { GlassCard } from '../components/GlassUI';
import { useTerms } from '../features/auth/hooks/useTerms';

export const TermsConditions: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { data: terms, isLoading } = useTerms();

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-secondary">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="pb-10 min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-4 flex items-center gap-4">
        <button
          onClick={() => navigate({ to: '/profile' })}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <h1 className="text-xl font-bold text-primary">{t('terms_conditions')}</h1>
      </div>

      <div className="p-5 space-y-6 animate-in fade-in duration-500">
        {terms?.map((term) => (
          <React.Fragment key={term.id}>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-lg font-bold text-primary">{term.title}</h2>
              <p className="text-sm text-secondary mt-1">{term.description}</p>
            </div>

            <div className="space-y-4">
              {term.features.map((feature, index) => (
                <GlassCard key={feature.id} className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-brand-500">
                    {index === 2 ? <AlertCircle size={20} className="text-red-500" /> : <ScrollText size={20} />}
                    <h3 className={`font-bold ${index === 2 ? 'text-red-500' : ''}`}>
                      {index + 1}. {feature.description.split(':')[0]}
                    </h3>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">
                    {feature.description.includes(':')
                      ? feature.description.split(':').slice(1).join(':').trim()
                      : feature.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </React.Fragment>
        ))}

        <div className="pt-4 text-center">
          <p className="text-xs text-secondary opacity-50 italic">
            {t('last_updated') || 'Last Updated'}: {new Date().toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};
