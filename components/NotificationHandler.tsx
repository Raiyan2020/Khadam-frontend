import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { router } from '../router';
import { useFcmToken } from '../features/auth/hooks/useFcmToken';
import { NOTIFICATION_QUERY_KEYS } from '../features/auth/hooks/useNotifications';
import { onMessageListener } from '../lib/firebase';
import { useIsAuthenticated } from '../lib/useIsAuthenticated';
import { resolveNotificationUrl } from '../lib/notificationRouting';

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
  const queryClient = useQueryClient();

  // Registers the service worker, requests permission, syncs the token to the backend.
  useFcmToken();

  // Foreground push handler
  useEffect(() => {
    const unsubscribe = onMessageListener((payload: any) => {
      const notif = payload.notification || {};
      const data = payload.data || {};
      const title = notif.title || data.title || 'إشعار جديد';
      const body = notif.body || data.body || data.description || data.message || '';
      const clickUrl = resolveNotificationUrl(data);

      // The push already landed in the inbox server-side — pull it in so the
      // badge and any open list reflect it without a manual refresh.
      NOTIFICATION_QUERY_KEYS.forEach(queryKey => queryClient.invalidateQueries({ queryKey }));

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
  }, [queryClient]);

  // Background notification taps arrive as a service worker message.
  useEffect(() => {
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        NOTIFICATION_QUERY_KEYS.forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
        navigateTo(event.data.url || '/notifications');
      }
    };
    navigator.serviceWorker?.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onSwMessage);
  }, [queryClient]);

  return null;
};

function navigateTo(url: string) {
  try {
    router.navigate({ to: url } as any);
  } catch {
    window.location.href = url;
  }
}
