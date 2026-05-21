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

firebase.initializeApp({
  apiKey: "AIzaSyAuajcC5Bf6jn-B_BcQtKOzak63dpajzyM",
  authDomain: "khadam-f693b.firebaseapp.com",
  projectId: "khadam-f693b",
  storageBucket: "khadam-f693b.firebasestorage.app",
  messagingSenderId: "1080039978592",
  appId: "1:1080039978592:web:7a4afa17072ed68f63b505",
  measurementId: "G-4S1NWD12QF"
});

const messaging = firebase.messaging();

// ── Universal background push handler ──────────────────────────────
// This handles background messages (when the tab is closed or minimized)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] onBackgroundMessage payload:', payload);

  const notif = payload.notification || {};
  const data = payload.data || {};
  const title = notif.title || data.title || 'إشعار جديد';
  const body = notif.body || data.body || data.description || data.message || '';
  const clickUrl = data.url || '/notifications';

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
