import React from 'react';
import { ArrowLeft, ArrowRight, Bell, CheckCircle } from 'lucide-react';
import { useLanguage } from '../i18n';
import { GlassCard } from '../components/GlassUI';

interface NotificationsProps {
  onBack: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onBack }) => {
  const { t, dir } = useLanguage();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: { en: "Application Update", ar: "تحديث الطلب" },
      message: { en: "Your request for Maria Santos has been received by the office.", ar: "تم استلام طلبك للعاملة ماريا سانتوس من قبل المكتب." },
      time: "2m ago",
      read: false
    },
    {
      id: 2,
      title: { en: "New Message", ar: "رسالة جديدة" },
      message: { en: "Al-Nour Recruitment sent you a message regarding your inquiry.", ar: "أرسل لك مكتب النور رسالة بخصوص استفسارك." },
      time: "1h ago",
      read: false
    },
    {
      id: 3,
      title: { en: "Price Drop Alert", ar: "تنبيه انخفاض السعر" },
      message: { en: "A worker you viewed has a new lower salary offer.", ar: "عامل قمت بمشاهدته لديه عرض راتب أقل جديد." },
      time: "1d ago",
      read: true
    }
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-5 pt-8 pb-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
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

      <div className="px-5 mt-6 space-y-3">
        {notifications.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-secondary">
             <Bell size={48} className="mb-4 opacity-20" />
             <p>{t('no_notifications')}</p>
           </div>
        ) : (
          notifications.map(notif => (
            <GlassCard key={notif.id} className={`flex gap-4 ${!notif.read ? 'bg-accent/5 border-accent/20' : ''}`}>
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-red-500' : 'bg-transparent'}`} />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${!notif.read ? 'font-bold text-primary' : 'font-medium text-primary/80'}`}>
                    {notif.title[dir === 'rtl' ? 'ar' : 'en']}
                  </h3>
                  <span className="text-[10px] text-secondary">{notif.time}</span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  {notif.message[dir === 'rtl' ? 'ar' : 'en']}
                </p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};