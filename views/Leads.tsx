'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import { useLanguage } from '../i18n';

export const Leads: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-secondary space-y-4 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-glass flex items-center justify-center border border-border">
        <Inbox size={40} className="text-secondary/50" />
      </div>
      <h2 className="text-lg font-medium text-primary">{t('nav_leads')}</h2>
      <p className="text-sm">{t('no_leads')}</p>
    </div>
  );
};