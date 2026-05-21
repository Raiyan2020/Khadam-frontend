import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { router } from '../router';
import { usePollingNotifications } from '../features/auth/hooks/usePollingNotifications';
import { useFcmToken } from '../features/auth/hooks/useFcmToken';
import { onMessageListener } from '../lib/firebase';

const SHOWN_IDS_KEY = 'khadam_shown_notif_ids';
const MAX_STORED_IDS = 100;

function getShownIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SHOWN_IDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveShownIds(ids: Set<string>) {
  try {
    const arr = Array.from(ids).slice(-MAX_STORED_IDS);
    localStorage.setItem(SHOWN_IDS_KEY, JSON.stringify(arr));
  } catch { /* ignore quota errors */ }
}

/**
 * NotificationHandler
 *
 * 1. Initializes FCM token registration and service worker registration using useFcmToken().
 * 2. Polls /notifications/unread every 30 s as a fallback.
 * 3. Listens to Firebase Cloud Messaging onMessageListener for real-time foreground pushes.
 * 4. Displays a Sonner toast with navigatability.
 */
export const NotificationHandler: React.FC = () => {
  const isFirstPoll = useRef(true);
  const { data: pollData } = usePollingNotifications();
  
  // Initialize FCM (registers service worker, gets token, updates backend)
  useFcmToken();

  // Foreground push notification handler
  useEffect(() => {
    const unsubscribe = onMessageListener((payload: any) => {
      console.log('[NotificationHandler] Foreground push received:', payload);
      
      const notif = payload.notification || {};
      const data = payload.data || {};
      const title = notif.title || data.title || 'إشعار جديد';
      const body = notif.body || data.body || data.description || data.message || '';
      const clickUrl = data.url || '/notifications';

      toast(title, {
        description: body || undefined,
        duration: 8000,
        action: {
          label: 'عرض',
          onClick: () => {
            try {
              router.navigate({ to: clickUrl } as any);
            } catch {
              window.location.href = clickUrl;
            }
          },
        },
      });
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Polling fallback handler
  useEffect(() => {
    if (!pollData?.data) return;

    const unreadItems = pollData.data;
    const shownIds = getShownIds();

    // First load — record existing IDs as baseline, show nothing
    if (isFirstPoll.current) {
      isFirstPoll.current = false;
      unreadItems.forEach((n) => shownIds.add(n.id));
      saveShownIds(shownIds);
      return;
    }

    // Find any new IDs not yet shown
    const newItems = unreadItems.filter((n) => !shownIds.has(n.id));
    if (newItems.length === 0) return;

    // Mark them all as seen immediately
    newItems.forEach((n) => shownIds.add(n.id));
    saveShownIds(shownIds);

    // Show a toast for the newest one (avoid multiple toasts at once)
    const target = newItems[0];
    const title   = target.data?.title       || 'إشعار جديد';
    const body    = target.data?.description || target.data?.message || '';
    const clickUrl = target.data?.ad_id ? `/ads/${target.data.ad_id}` : '/notifications';

    toast(title, {
      description: body || undefined,
      duration: 6000,
      action: {
        label: 'عرض',
        onClick: () => {
          try {
            router.navigate({ to: clickUrl } as any);
          } catch {
            window.location.href = clickUrl;
          }
        },
      },
    });
  }, [pollData]);

  // Handle SW notification-click deep-link (background taps)
  useEffect(() => {
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        const url: string = event.data.url || '/notifications';
        try {
          router.navigate({ to: url } as any);
        } catch {
          window.location.href = url;
        }
      }
    };
    navigator.serviceWorker?.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onSwMessage);
  }, []);

  return null;
};

