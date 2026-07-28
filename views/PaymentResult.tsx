import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Copy, Check, Home, Receipt, RefreshCw, LifeBuoy } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';

type PaymentStatus = 'success' | 'fail';

/**
 * Landing screens for the payment gateway redirect:
 *   /payment-success/:transactionId
 *   /payment-fail/:transactionId
 *
 * The gateway sends the browser here after the office pays for a package, so
 * this is a cold page load — it must render without depending on any in-app
 * state left over from /checkout.
 */
const PaymentResult: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const { transactionId } = useParams({ strict: false }) as { transactionId?: string };
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const isSuccess = status === 'success';

  // A completed payment changes the office's subscription and ad allowance, so
  // drop the cached copies rather than showing pre-payment state.
  useEffect(() => {
    if (!isSuccess) return;
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['packageDetail'] });
    queryClient.invalidateQueries({ queryKey: ['my-ads'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['companyHomeData'] });
  }, [isSuccess, queryClient]);

  const handleCopy = async () => {
    if (!transactionId) return;
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the id stays visible on screen regardless */
    }
  };

  const accent = isSuccess
    ? {
        ring: 'bg-green-500/10',
        ringOuter: 'bg-green-500/5',
        icon: 'text-green-500',
        glow: 'from-green-500/20',
      }
    : {
        ring: 'bg-red-500/10',
        ringOuter: 'bg-red-500/5',
        icon: 'text-red-500',
        glow: 'from-red-500/20',
      };

  const StatusIcon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Ambient glow, tinted by outcome */}
      <div
        className={`absolute top-[-15%] left-[-10%] w-[120%] h-[45%] bg-gradient-to-b ${accent.glow} to-transparent rounded-[100%] blur-3xl pointer-events-none`}
      />

      <div className="w-full max-w-sm z-10 flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Icon with concentric halo */}
        <div className={`relative w-28 h-28 rounded-full ${accent.ringOuter} flex items-center justify-center`}>
          <div className={`w-20 h-20 rounded-full ${accent.ring} flex items-center justify-center`}>
            <StatusIcon
              size={48}
              strokeWidth={1.75}
              className={`${accent.icon} animate-in zoom-in-50 duration-500`}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <h1 className="text-2xl font-black text-primary">
            {isSuccess ? t('payment_success_title') : t('payment_fail_title')}
          </h1>
          <p className="text-sm text-secondary leading-relaxed px-2">
            {isSuccess ? t('payment_success_desc') : t('payment_fail_desc')}
          </p>
        </div>

        {/* Transaction reference — the one thing support will ask for */}
        {transactionId && (
          <div className="w-full bg-glass backdrop-blur-xl border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="text-start min-w-0">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">
                {t('transaction_id')}
              </p>
              <p className="text-sm font-mono font-bold text-primary truncate" dir="ltr">
                {transactionId}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-9 h-9 shrink-0 rounded-xl bg-glassHigh border border-border flex items-center justify-center text-secondary hover:text-primary transition-colors"
              aria-label={t('copy')}
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="w-full space-y-2.5 pt-2">
          {isSuccess ? (
            <>
              <Button
                fullWidth
                variant="primary"
                className="h-12 gap-2"
                onClick={() => navigate({ to: '/subscriptions' })}
              >
                <Receipt size={18} />
                {t('view_subscriptions')}
              </Button>
              <Button
                fullWidth
                variant="secondary"
                className="h-12 gap-2"
                onClick={() => navigate({ to: '/' })}
              >
                <Home size={18} />
                {t('back_home')}
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="primary"
                className="h-12 gap-2"
                onClick={() => navigate({ to: '/subscriptions' })}
              >
                <RefreshCw size={18} />
                {t('try_again')}
              </Button>
              <Button
                fullWidth
                variant="secondary"
                className="h-12 gap-2"
                onClick={() => navigate({ to: '/help-support' })}
              >
                <LifeBuoy size={18} />
                {t('contact_support')}
              </Button>
            </>
          )}
        </div>

        {!isSuccess && (
          <p className="text-[11px] text-secondary/80 leading-relaxed px-2">
            {t('payment_fail_note')}
          </p>
        )}
      </div>
    </div>
  );
};

export const PaymentSuccess: React.FC = () => <PaymentResult status="success" />;
export const PaymentFail: React.FC = () => <PaymentResult status="fail" />;
