// ═══════════════════════════════════════════════════════════════
//  Firebase Messaging Service Worker  –  Khadam App
//  Handles ALL push notifications (background AND foreground).
// ═══════════════════════════════════════════════════════════════

// ── Force this new SW to take control immediately ────────────────
// Without this the browser keeps the old SW alive until all tabs close.
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

// ── Universal push handler ────────────────────────────────────────
// Firebase compat SDK intercepts the 'push' event.
// onBackgroundMessage fires ONLY when the message is data-only AND the
// app is in the background. For notification-field messages the compat SDK
// would auto-show silently. We override this by handling everything here.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] onBackgroundMessage payload:', payload);

  // If the app tab is focused, forward the payload to the main thread
  // so NotificationHandler.tsx can display it.
  // If the tab is not focused, show the notification ourselves.
  event_waitUntil_show(payload);
});

// ── Raw push event (diagnostic + foreground forwarding) ──────────
// This fires for EVERY push, before Firebase compat processes it.
// We use it to:
//  1. Log that the SW is actually receiving pushes.
//  2. Forward the payload to any focused tab so onMessage fires.
self.addEventListener('push', (event) => {
  console.log('[SW] Raw push event received');

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn('[SW] Could not parse push payload as JSON:', e);
  }

  console.log('[SW] Push payload:', payload);

  // Try to forward to any open focused window FIRST so the React
  // onMessage listener can handle it as a foreground notification.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const focusedClient = windowClients.find(
        (c) => c.visibilityState === 'visible' && c.url.startsWith(self.location.origin)
      );

      if (focusedClient) {
        // App is in foreground – let NotificationHandler.tsx handle display.
        // Post a message so it can show a native notification.
        focusedClient.postMessage({ type: 'FCM_FOREGROUND', payload });
        console.log('[SW] Forwarded to foreground tab');
        // Do NOT show a notification here – the tab will do it.
        return;
      }

      // No focused tab → show notification ourselves.
      const notif    = payload.notification || {};
      const data     = payload.data         || {};
      const title    = notif.title || data.title || 'إشعار جديد';
      const body     = notif.body  || data.body  || '';
      const icon     = notif.icon  || data.icon  || '/favicon.ico';
      const clickUrl = data.url    || '/notifications';

      console.log('[SW] Showing background notification:', title);
      return self.registration.showNotification(title, {
        body,
        icon,
        badge: '/favicon.ico',
        data: { url: clickUrl },
        vibrate: [200, 100, 200],
        tag: 'khadam-notification',
      });
    })
  );
});

// ── Notification click ────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const clickUrl = event.notification.data?.url || '/notifications';
  const absoluteUrl = clickUrl.startsWith('http')
    ? clickUrl
    : self.location.origin + clickUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: clickUrl });
          return;
        }
      }
      return clients.openWindow(absoluteUrl);
    })
  );
});

// ── Helper (unused direct call – onBackgroundMessage uses this) ──
function event_waitUntil_show(payload) {
  // This is a no-op: the raw 'push' listener above already handles
  // both foreground forwarding and background display.
  // onBackgroundMessage is kept only to satisfy the compat SDK contract.
}
