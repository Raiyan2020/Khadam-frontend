import React from 'react';
import { ChevronLeft, ChevronRight, Phone, Mail, Send, Instagram, Twitter, Facebook, MessageCircle, Loader2 } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { useContactUs, ContactUsPayload } from '../features/auth/hooks/useContactUs';
import { zodResolver } from "@hookform/resolvers/zod"

const getContactSchema = (t: (key: any) => string) => z.object({
  name: z.string().min(3, t('v_name_min') || 'Name must be at least 3 characters'),
  email: z.string().email(t('invalid_email') || 'Invalid email address'),
  message: z.string().min(10, t('v_message_min') || 'Message must be at least 10 characters'),
});

export const HelpSupport: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const contactUs = useContactUs();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactUsPayload>({
    resolver: zodResolver(getContactSchema(t)),
  });

  const onSubmit = (data: ContactUsPayload) => {
    contactUs.mutate(data, {
      onSuccess: (res) => {
        toast.success(res.message || t('message_sent_success'));
        reset();
      },
      onError: (error: any) => {
        toast.error(error.message);
      }
    });
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

      <div className="p-5 space-y-6 animate-in fade-in duration-500">
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
                <p className="text-xs text-secondary">{t('available_24_7') || 'Available 24/7'}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Send Email Form */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-primary px-1">{t('send_email')}</h2>
          <GlassCard className="p-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-secondary ms-1">{t('your_name')}</label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full h-12 bg-background border rounded-xl px-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${errors.name ? 'border-red-500' : 'border-border focus:border-brand-400'
                    }`}
                />
                {errors.name && <p className="text-[10px] text-red-500 ms-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-secondary ms-1">{t('your_email')}</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full h-12 bg-background border rounded-xl px-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${errors.email ? 'border-red-500' : 'border-border focus:border-brand-400'
                    }`}
                  dir="ltr"
                />
                {errors.email && <p className="text-[10px] text-red-500 ms-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-secondary ms-1">{t('message')}</label>
                <textarea
                  {...register('message')}
                  className={`w-full min-h-[120px] bg-background border rounded-xl px-4 py-3 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-y ${errors.message ? 'border-red-500' : 'border-border focus:border-brand-400'
                    }`}
                />
                {errors.message && <p className="text-[10px] text-red-500 ms-1">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12 flex items-center justify-center gap-2 mt-2"
                disabled={contactUs.isPending}
              >
                {contactUs.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    <span>{t('send_message')}</span>
                  </>
                )}
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
    className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 bg-glass border border-border ${color} ${hover}`}
  >
    {icon}
  </button>
);
