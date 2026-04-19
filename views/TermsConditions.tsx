import React from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, ScrollText, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../i18n';
import { GlassCard } from '../components/GlassUI';

export const TermsConditions: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="pb-10 min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 flex items-center gap-4">
        <button 
          onClick={() => navigate({ to: '/profile' })}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <h1 className="text-xl font-bold text-primary">{t('terms_conditions')}</h1>
      </div>

      <div className="p-5 space-y-6">
        <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4">
                <ShieldCheck size={32} />
            </div>
            <h2 className="text-lg font-bold text-primary">Your Privacy & Trust</h2>
            <p className="text-sm text-secondary mt-1">Please read our terms carefully before using the app.</p>
        </div>

        <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-brand-500">
                <ScrollText size={20} />
                <h3 className="font-bold">1. General Usage</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
                By using Khadam App, you agree to comply with all local laws regarding domestic worker recruitment. 
                Our platform acts as a bridge between recruitment offices and families.
            </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-brand-500">
                <ScrollText size={20} />
                <h3 className="font-bold">2. Verified Information</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
                Recruitment offices are responsible for the accuracy of worker data, including experience, skills, and documentation. 
                We encourage users to verify all details directly with the office.
            </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
                <AlertCircle size={20} />
                <h3 className="font-bold">3. Prohibited Content</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
                Any form of discrimination, harassment, or illegal advertisement is strictly prohibited. 
                Accounts violating these rules will be permanently suspended.
            </p>
        </GlassCard>

        <div className="pt-4 text-center">
            <p className="text-xs text-secondary opacity-50 italic">Last Updated: April 2024</p>
        </div>
      </div>
    </div>
  );
};
