import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../i18n';
import { LoginForm, LoginFormLinks } from '../features/auth/components/LoginForm';
import {
  AUTH_REQUIRED_EVENT,
  LoginRequest,
  consumePendingLoginRequest,
  clearPendingLoginRequest,
} from '../lib/authBridge';

/**
 * Global login popup for guest mode.
 *
 * Opens whenever anything calls `requestLogin()` — the router guard when a guest
 * hits a protected route, apiFetch on a `needLogin` response, or a component
 * gating an action. Listening to the event directly (rather than via context)
 * means non-React callers work without any wiring.
 *
 * Mount once, inside the router tree (the form navigates).
 */
export const LoginModal: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const open = useCallback((request?: LoginRequest) => {
    setRedirectTo(request?.redirectTo ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setRedirectTo(null);
    clearPendingLoginRequest();
  }, []);

  useEffect(() => {
    const onAuthRequired = (event: Event) => {
      open((event as CustomEvent<LoginRequest>).detail);
    };
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);

    // Drain a request made before this listener attached — e.g. a cold-start
    // deep link into a protected route, where the router guard runs first.
    const pending = consumePendingLoginRequest();
    if (pending) open(pending);

    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
  }, [open]);

  // Close on Escape, matching the backdrop click.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  const handleNavigateAway = (to: string) => {
    close();
    navigate({ to } as any);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir={dir}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={close}
      />

      <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto no-scrollbar animate-in zoom-in-95 fade-in duration-300">
        <button
          type="button"
          onClick={close}
          className="absolute top-0 end-0 z-10 w-9 h-9 rounded-full bg-glass border border-border flex items-center justify-center text-secondary hover:text-primary transition-colors"
          aria-label={t('close') || 'Close'}
        >
          <X size={18} />
        </button>

        <div className="space-y-6 pt-12 pb-2">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-glass border border-border rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/10">
              <img
                src="https://raiyansoft.com/wp-content/uploads/2026/02/icon-s-d.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-primary">
              {t('sign_in') || 'Sign In'}
            </h2>
            <p className="text-sm text-secondary px-4">
              {t('login_required_desc') || 'Sign in to continue'}
            </p>
          </div>

          <LoginForm
            skipRedirect
            onAuthenticated={({ isProfileComplete }) => {
              close();
              // Resume whatever the guest was trying to reach. An incomplete
              // profile is already being routed to /complete-profile.
              if (isProfileComplete && redirectTo) {
                navigate({ to: redirectTo } as any);
              }
            }}
          />

          <LoginFormLinks onNavigate={handleNavigateAway} />
        </div>
      </div>
    </div>
  );
};
