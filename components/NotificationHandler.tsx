import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { router } from '../router';
import { useFcmToken } from '../features/auth/hooks/useFcmToken';
import { onMessageListener } from '../lib/firebase';
import { useIsAuthenticated } from '../lib/useIsAuthenticated';

/**
 * NotificationHandler
 *
 * Firebase Cloud Messaging only — there is no polling fallback. The unread
 * endpoint requires a token, so polling it meant a guest fired a 401 every
 * 30 seconds; FCM pushes cost nothing while signed out.
 *
 * Mounts nothing at all for guests: no service worker, no permission prompt,
 * no push subscription. Everything starts on login and tears down on logout.
 */
export const NotificationHandler: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  // Remounts on login/logout, which starts/tears down FCM in one place.
  return isAuthenticated ? <AuthenticatedNotifications /> : null;
};

const AuthenticatedNotifications: React.FC = () => {
  // Registers the service worker, requests permission, syncs the token to the backend.
  useFcmToken();

  // Foreground push handler
  useEffect(() => {
    const unsubscribe = onMessageListener((payload: any) => {
      const notif = payload.notification || {};
      const data = payload.data || {};
      const title = notif.title || data.title || 'إشعار جديد';
      const body = notif.body || data.body || data.description || data.message || '';
      const clickUrl = data.url || (data.ad_id ? `/worker/${data.ad_id}` : '/notifications');

      toast(title, {
        description: body || undefined,
        duration: 8000,
        action: {
          label: 'عرض',
          onClick: () => navigateTo(clickUrl),
        },
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Background notification taps arrive as a service worker message.
  useEffect(() => {
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        navigateTo(event.data.url || '/notifications');
      }
    };
    navigator.serviceWorker?.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onSwMessage);
  }, []);

  return null;
};

function navigateTo(url: string) {
  try {
    router.navigate({ to: url } as any);
  } catch {
    window.location.href = url;
  }
}
