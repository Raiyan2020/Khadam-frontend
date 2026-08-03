// ═══════════════════════════════════════════════════════════════
//  Firebase Messaging Service Worker  –  Khadam App
//  Handles background push notifications and deep-linking clicks.
// ═══════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker…');
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated. Claiming all clients…');
  event.waitUntil(clients.claim()); // control all open tabs right now
});

// ── Import Firebase compat (must come AFTER install/activate) ────
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Keep in sync with lib/firebase.ts
firebase.initializeApp({
  apiKey: "AIzaSyAuajcC5Bf6jn-B_BcQtKOzak63dpajzyM",
  authDomain: "khadam-f693b.firebaseapp.com",
  databaseURL: "https://khadam-f693b-default-rtdb.firebaseio.com",
  projectId: "khadam-f693b",
  storageBucket: "khadam-f693b.firebasestorage.app",
  messagingSenderId: "1080039978592",
  appId: "1:1080039978592:web:7a4afa17072ed68f63b505",
  measurementId: "G-4S1NWD12QF"
});

const messaging = firebase.messaging();

// ── Routing ────────────────────────────────────────────────────────
// Mirror of lib/notificationRouting.ts — a service worker can't import from
// the app bundle, so keep the two in sync. Admin broadcasts (`admin_notify`
// / `general`) carry no related_data and always land on the inbox.
const INBOX_ONLY_TYPES = ['general', 'admin_notify'];

function resolveNotificationUrl(data) {
  if (data.url) return String(data.url);

  const type = String(data.notification_type || data.type || '').toLowerCase();
  if (INBOX_ONLY_TYPES.includes(type)) return '/notifications';

  const raw = data.related_data || data.ad_id || '';
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === 'null' || trimmed === '{}' || trimmed === '[]') return '/notifications';

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const id = Array.isArray(parsed) ? (parsed[0] && parsed[0].id) : (parsed.ad_id || parsed.id);
      return id ? `/worker/${id}` : '/notifications';
    } catch (e) {
      return '/notifications';
    }
  }

  return `/worker/${trimmed}`;
}

// ── Universal background push handler ──────────────────────────────
// This handles background messages (when the tab is closed or minimized)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] onBackgroundMessage payload:', payload);

  const notif = payload.notification || {};
  const data = payload.data || {};
  const title = notif.title || data.title || 'إشعار جديد';
  const body = notif.body || data.body || data.description || data.message || '';
  const clickUrl = resolveNotificationUrl(data);

  return self.registration.showNotification(title, {
    body,
    icon: notif.icon || data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: clickUrl },
    vibrate: [200, 100, 200],
    tag: 'khadam-notification',
  });
});

// ── Notification Click Routing ─────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const clickUrl = event.notification.data?.url || '/notifications';
  const absoluteUrl = clickUrl.startsWith('http')
    ? clickUrl
    : self.location.origin + clickUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If an app tab is already open, focus it and post a routing message
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: clickUrl });
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(absoluteUrl);
    })
  );
});
