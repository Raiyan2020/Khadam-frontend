import React, { useEffect, useRef } from 'react';
import { router } from '../router';
import { usePollingNotifications } from '../features/auth/hooks/usePollingNotifications';

// ─── Persistence key for IDs we've already shown a notification for ──────────
const SHOWN_IDS_KEY = 'khadam_shown_notif_ids';
const MAX_STORED_IDS = 100; // cap to avoid unbounded localStorage growth

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
    // Keep only the last N IDs to bound storage size
    const arr = Array.from(ids).slice(-MAX_STORED_IDS);
    localStorage.setItem(SHOWN_IDS_KEY, JSON.stringify(arr));
  } catch { /* ignore quota errors */ }
}

/**
 * NotificationHandler
 *
 * Polls /notifications/unread every 30 s via usePollingNotifications.
 * For every unread notification whose ID hasn't been shown before,
 * fires a native browser / OS notification.
 *
 * On the FIRST poll (app just loaded) all current unread IDs are recorded
 * as "seen baseline" so the user isn't spammed with old notifications on login.
 * Only notifications that arrive AFTER the first poll will pop up.
 */
export const NotificationHandler: React.FC = () => {
  const isFirstPoll = useRef(true);
  const { data: pollData } = usePollingNotifications();

  // ── Request OS notification permission once on mount ─────────────────
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((p) => {
        console.log('[Notif] Permission result:', p);
      });
    } else {
      console.log('[Notif] Permission already:', Notification.permission);
    }
  }, []);

  // ── Detect new unread notifications and show browser notifications ───
  useEffect(() => {
    if (!pollData?.data) return;

    const unreadItems = pollData.data; // sorted newest-first by the API
    console.log('[Notif] Poll received. Unread count:', unreadItems.length, '| First poll:', isFirstPoll.current);

    const shownIds = getShownIds();

    if (isFirstPoll.current) {
      // First load: record all current IDs as baseline (don't show them).
      isFirstPoll.current = false;
      unreadItems.forEach((n) => shownIds.add(n.id));
      saveShownIds(shownIds);
      console.log('[Notif] Baseline set with', shownIds.size, 'IDs – no notification shown');
      return;
    }

    // Subsequent polls: find IDs we haven't shown yet
    const newItems = unreadItems.filter((n) => !shownIds.has(n.id));
    console.log('[Notif] New items since last poll:', newItems.length);

    if (newItems.length === 0) return;

    // Mark them all as shown now (even if display fails, don't repeat)
    newItems.forEach((n) => shownIds.add(n.id));
    saveShownIds(shownIds);

    // Show a notification for the newest one only
    // (avoid bombarding user if multiple arrive at once)
    const target = newItems[0];
    const title   = target.data?.title       || 'إشعار جديد';
    const body    = target.data?.description || target.data?.message || '';

    console.log('[Notif] Firing browser notification:', { title, body });
    showNotification(title, body, '/favicon.ico', '/notifications');
  }, [pollData]);

  // ── Handle notification click forwarded from the service worker ───────
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

// ─── Show a real OS notification ─────────────────────────────────────────────
async function showNotification(title: string, body: string, icon: string, clickUrl: string) {
  if (!('Notification' in window)) {
    console.warn('[Notif] Notification API not available');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[Notif] Permission not granted:', Notification.permission);
    return;
  }

  // ── Try via ServiceWorker registration (persistent, works when tab loses focus) ──
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon,
        badge: '/favicon.ico',
        data: { url: clickUrl },
        vibrate: [200, 100, 200],
        tag: 'khadam-notification',
      } as NotificationOptions);
      console.log('[Notif] ✅ Shown via ServiceWorker');
      return;
    } catch (swErr) {
      console.warn('[Notif] SW showNotification failed, trying constructor:', swErr);
    }
  }

  // ── Fallback: plain Notification constructor ──────────────────────────
  try {
    const n = new Notification(title, { body, icon });
    n.onclick = (e) => {
      e.preventDefault();
      window.focus();
      navigateTo(clickUrl);
    };
    console.log('[Notif] ✅ Shown via Notification constructor');
  } catch (err) {
    console.error('[Notif] ❌ Both notification methods failed:', err);
  }
}

// ─── In-app navigation ────────────────────────────────────────────────────────
function navigateTo(url: string) {
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    router.navigate({ to: path } as any);
  } catch {
    window.location.href = url;
  }
}
