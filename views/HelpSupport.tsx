import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Phone, Mail, Send, Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';

import { useNavigate } from '@tanstack/react-router';

export const HelpSupport: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the email via an API
    console.log('Sending email:', { name, email, message });
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    alert('Message sent successfully!'); // Simple feedback for now
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 flex items-center gap-4">
        <button 
          onClick={() => navigate({ to: '/profile' })}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <h1 className="text-xl font-bold text-primary">{t('help_support')}</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Contact Number */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-primary px-1">{t('support_number')}</h2>
          <GlassCard className="p-4 flex items-center justify-between group cursor-pointer hover:border-brand-400 transition-colors" onClick={() => window.location.href = 'tel:+96512345678'}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">+965 1234 5678</p>
                <p className="text-xs text-secondary">Available 24/7</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Send Email Form */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-primary px-1">{t('send_email')}</h2>
          <GlassCard className="p-5">
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-secondary ms-1">{t('your_name')}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-secondary ms-1">{t('your_email')}</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  dir="ltr"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-secondary ms-1">{t('message')}</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[100px] bg-background border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all resize-y"
                  required
                />
              </div>
              <Button type="submit" variant="primary" className="w-full h-12 flex items-center justify-center gap-2 mt-2">
                <Send size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                <span>{t('send_message')}</span>
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Social Media Links */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-primary px-1">{t('follow_us')}</h2>
          <div className="grid grid-cols-4 gap-3">
            <SocialButton icon={<MessageCircle size={24} />} color="text-green-500" bg="bg-green-500/10" hover="hover:bg-green-500 hover:text-white" onClick={() => window.open('https://wa.me/96512345678', '_blank')} />
            <SocialButton icon={<Instagram size={24} />} color="text-pink-500" bg="bg-pink-500/10" hover="hover:bg-pink-500 hover:text-white" onClick={() => window.open('https://instagram.com', '_blank')} />
            <SocialButton icon={<Twitter size={24} />} color="text-blue-400" bg="bg-blue-400/10" hover="hover:bg-blue-400 hover:text-white" onClick={() => window.open('https://twitter.com', '_blank')} />
            <SocialButton icon={<Facebook size={24} />} color="text-blue-600" bg="bg-blue-600/10" hover="hover:bg-blue-600 hover:text-white" onClick={() => window.open('https://facebook.com', '_blank')} />
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialButton: React.FC<{ icon: React.ReactNode; color: string; bg: string; hover: string; onClick: () => void }> = ({ icon, color, bg, hover, onClick }) => (
  <button 
    onClick={onClick}
    className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 ${bg} ${color} ${hover}`}
  >
    {icon}
  </button>
);
