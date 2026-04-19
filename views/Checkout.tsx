import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, CreditCard, Ticket, ShieldCheck, Wallet } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useLanguage } from '../i18n';
import { GlassCard, Button } from '../components/GlassUI';

interface SubscriptionPlan {
  id: string;
  nameKey: string;
  durationKey: string;
  priceKey: string;
  price: number;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    nameKey: 'plan_basic_name',
    durationKey: 'plan_basic_duration',
    priceKey: 'plan_basic_price',
    price: 25
  },
  {
    id: 'pro',
    nameKey: 'plan_pro_name',
    durationKey: 'plan_pro_duration',
    priceKey: 'plan_pro_price',
    price: 45
  },
  {
    id: 'premium',
    nameKey: 'plan_premium_name',
    durationKey: 'plan_premium_duration',
    priceKey: 'plan_premium_price',
    price: 75
  }
];

export const Checkout: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const search = useSearch({ from: '/checkout' }) as { planId?: string };
  const planId = search.planId || 'pro';
  
  const plan = PLANS.find(p => p.id === planId) || PLANS[1];
  
  const [coupon, setCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'knet'>('knet');
  const [isApplied, setIsApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'SAVE10') {
      setDiscount(plan.price * 0.1);
      setIsApplied(true);
    } else {
      alert('Invalid coupon code. Try SAVE10');
    }
  };

  const total = plan.price - discount;

  const handlePay = () => {
    // Simulate payment process
    alert('Payment Successful!');
    navigate({ to: '/profile' });
  };

  return (
    <div className="pb-10 min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pb-4 pt-6 px-5 flex items-center gap-4">
        <button 
          onClick={() => navigate({ to: '/subscriptions' })}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <h1 className="text-xl font-bold text-primary">{t('checkout_title')}</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Order Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider px-1">{t('order_summary')}</h2>
          <GlassCard className="p-5 flex justify-between items-center bg-brand-500/5 border-brand-500/20">
            <div>
              <h3 className="font-bold text-primary text-lg">{t(plan.nameKey as any)}</h3>
              <p className="text-xs text-secondary mt-0.5">{t(plan.durationKey as any)}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-brand-500">{plan.price} {t('kwd')}</span>
            </div>
          </GlassCard>
        </div>

        {/* Coupon Code */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-secondary uppercase tracking-wider px-1">{t('coupon_code')}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-secondary">
                <Ticket size={18} />
              </div>
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="SAVE10"
                className="w-full h-12 bg-glass border border-border rounded-xl ps-10 pe-4 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all uppercase"
                disabled={isApplied}
              />
            </div>
            <Button 
              onClick={applyCoupon} 
              variant="outline" 
              className={`px-6 h-12 ${isApplied ? 'bg-green-500/10 text-green-500 border-green-500/50' : ''}`}
              disabled={isApplied || !coupon}
            >
              {isApplied ? <Check size={20} /> : t('apply_coupon')}
            </Button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider px-1">{t('payment_method')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <PaymentOption 
              id="knet" 
              label={t('knet')} 
              icon={<Wallet size={20} />} 
              isSelected={paymentMethod === 'knet'} 
              onClick={() => setPaymentMethod('knet')} 
            />
            <PaymentOption 
              id="visa" 
              label={t('visa')} 
              icon={<CreditCard size={20} />} 
              isSelected={paymentMethod === 'visa'} 
              onClick={() => setPaymentMethod('visa')} 
            />
          </div>
        </div>

        {/* Total Summary */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Subtotal</span>
            <span className="text-primary font-medium">{plan.price} {t('kwd')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-500">
              <span className="font-medium">Discount (10%)</span>
              <span>-{discount.toFixed(3)} {t('kwd')}</span>
            </div>
          )}
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <span className="text-primary font-bold">{t('total_amount')}</span>
            <span className="text-2xl font-black text-brand-500">
              {total.toFixed(3)} {t('kwd')}
            </span>
          </div>
        </GlassCard>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-secondary">
          <ShieldCheck size={14} className="text-green-500" />
          <span>Secure Encrypted Payment Gateway</span>
        </div>

        {/* Pay Button */}
        <Button 
          onClick={handlePay} 
          variant="primary" 
          className="w-full h-14 text-lg font-bold shadow-xl shadow-brand-500/20"
        >
          {t('pay_now')}
        </Button>
      </div>
    </div>
  );
};

const PaymentOption: React.FC<{ 
  id: string, 
  label: string, 
  icon: React.ReactNode, 
  isSelected: boolean, 
  onClick: () => void 
}> = ({ id, label, icon, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 bg-glass
      ${isSelected ? 'border-brand-500 bg-brand-500/5' : 'border-border hover:border-brand-500/40'}
    `}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-brand-500 text-white' : 'bg-glassHigh text-secondary'}`}>
      {icon}
    </div>
    <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-secondary'}`}>{label}</span>
  </div>
);
