import React, { useState } from 'react';
import { GlassCard, Button } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useChangePassword } from '../features/auth/hooks/useChangePassword';
import { z } from 'zod';
import { toast } from 'sonner';

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePasswordMutation = useChangePassword();

  const schema = z
    .object({
      currentPassword: z.string().min(1, t('password_required') || 'Current password is required'),
      newPassword: z.string().min(8, t('password_min_length') || 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, t('password_required') || 'Confirm password is required'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t('passwords_not_match') || 'Passwords do not match',
      path: ['confirmPassword'],
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      schema.parse({ currentPassword, newPassword, confirmPassword });
      changePasswordMutation.mutate({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-5 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-brand-500/20 to-transparent rounded-[100%] blur-3xl pointer-events-none" />

      {/* Back button */}
      <div className="relative z-10 mb-6 pt-4">
        <button
          onClick={() => navigate({ to: '/profile' })}
          className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="w-full max-w-sm mx-auto z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-glass border border-border rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-brand-500/10">
            <Lock size={28} className="text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {t('change_password') || 'Change Password'}
          </h1>
          <p className="text-sm text-secondary">
            {t('change_password_desc') || 'Update your account password'}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {t('current_password') || 'Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('password_placeholder') || '••••••••'}
                  className="w-full h-12 px-4 pe-12 rounded-xl bg-glass border border-border text-primary placeholder:text-secondary text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-secondary hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showCurrent ? 'Hide' : 'Show'}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {t('new_password') || 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('password_placeholder') || '••••••••'}
                  className="w-full h-12 px-4 pe-12 rounded-xl bg-glass border border-border text-primary placeholder:text-secondary text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-secondary hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showNew ? 'Hide' : 'Show'}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary px-1">
                {t('confirm_password') || 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('password_placeholder') || '••••••••'}
                  className="w-full h-12 px-4 pe-12 rounded-xl bg-glass border border-border text-primary placeholder:text-secondary text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-secondary hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide' : 'Show'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm mt-2"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                : (t('save_changes') || 'Save Changes')}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
