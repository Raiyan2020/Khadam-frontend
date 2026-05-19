import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { router } from '../router';
import { usePollingNotifications } from '../features/auth/hooks/usePollingNotifications';

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
 * Polls /notifications/unread every 30 s.
 * The first poll sets a baseline (no toast shown for existing notifications).
 * Every subsequent poll that has a new unread notification shows a Sonner toast.
 * Clicking the toast navigates to /notifications.
 */
export const NotificationHandler: React.FC = () => {
  const isFirstPoll = useRef(true);
  const { data: pollData } = usePollingNotifications();

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

    toast(title, {
      description: body || undefined,
      duration: 6000,
      action: {
        label: 'عرض',
        onClick: () => {
          try {
            router.navigate({ to: '/notifications' } as any);
          } catch {
            window.location.href = '/notifications';
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
